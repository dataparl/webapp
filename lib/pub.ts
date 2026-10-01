// Vérification des rappels serveur d'AppLixir (sans dépendance, testé).
// La documentation publique d'AppLixir a varié selon les versions (noms des
// paramètres, GET ou POST, formule de signature). On accepte donc les
// variantes connues, mais TOUTES exigent le secret de rappel partagé
// (« callback secret » du tableau de bord) :
//  - md5(gameApiKey + gameId + userId + tid + secret)  (mode « MD5 et TID »)
//  - md5(gameApiKey + gameId + userId + secret)        (mode « MD5 »)
//  - md5(userId + tid + secret), md5(userId + secret)
//  - secret transmis tel quel (paramètre secretKey, mode simple en HTTPS)
// L'identifiant transmis au lecteur vidéo est un jeton opaque (32 caractères
// hexadécimaux) créé par le serveur pour un compte et une fiche : AppLixir ne
// reçoit ni l'identifiant du compte ni la fiche consultée.
import { createHash, timingSafeEqual } from "node:crypto";

export type Rappel = { gameApiKey: string; gameId: string; userId: string; tid: string; signature: string; secretKey?: string };

const ALIAS: Record<keyof Rappel, string[]> = {
  gameApiKey: ["gameApiKey", "apiKey", "api_key", "gameapikey"],
  gameId: ["gameId", "game_id", "siteId", "site_id", "gameid"],
  userId: ["userId", "user_id", "userid", "custom"],
  tid: ["tid", "uniquetid", "transactionId", "transaction_id"],
  signature: ["signature", "checksum", "sig", "hash"],
  secretKey: ["secretKey", "secret_key", "secret"],
};

// Lit un rappel depuis des paramètres (requête GET, formulaire ou JSON en POST).
export function lireRappel(p: Record<string, string>): Rappel {
  const v = (k: keyof Rappel) => { for (const a of ALIAS[k]) if (p[a]) return String(p[a]); return ""; };
  return { gameApiKey: v("gameApiKey"), gameId: v("gameId"), userId: v("userId"), tid: v("tid"), signature: v("signature"), secretKey: v("secretKey") };
}

const md5 = (s: string) => createHash("md5").update(s).digest("hex");
const egal = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };

export function signatureAttendue(r: Omit<Rappel, "signature">, secret: string): string {
  return md5(r.gameApiKey + r.gameId + r.userId + r.tid + secret);
}

export function rappelValide(r: Rappel, cleApi: string, secret: string): boolean {
  if (!secret || !r.userId) return false;
  if (r.gameApiKey && cleApi && r.gameApiKey !== cleApi) return false;
  if (r.secretKey) return egal(r.secretKey, secret);
  if (!/^[0-9a-f]{32}$/i.test(r.signature)) return false;
  const sig = r.signature.toLowerCase();
  const candidats = [
    r.tid && md5(r.gameApiKey + r.gameId + r.userId + r.tid + secret),
    md5(r.gameApiKey + r.gameId + r.userId + secret),
    r.tid && md5(r.userId + r.tid + secret),
    md5(r.userId + secret),
  ].filter((c): c is string => !!c);
  let ok = false;
  for (const c of candidats) ok = egal(c, sig) || ok; // pas de sortie anticipée
  return ok;
}

export const jetonValide = (j: string) => /^[0-9a-f]{32}$/.test(j);
