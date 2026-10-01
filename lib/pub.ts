// Vérification des rappels serveur d'AppLixir (sans dépendance, testé).
// Mode « MD5 et TID » : signature = md5(gameApiKey + gameId + userId + tid + secret).
// L'identifiant transmis au lecteur vidéo est un jeton opaque à usage unique
// (32 caractères hexadécimaux), créé par le serveur pour un compte et une fiche :
// AppLixir ne reçoit ni l'identifiant du compte ni la fiche consultée. Il fait
// partie de la signature.
import { createHash, timingSafeEqual } from "node:crypto";

export type Rappel = { gameApiKey: string; gameId: string; userId: string; tid: string; signature: string };

export function signatureAttendue(r: Omit<Rappel, "signature">, secret: string): string {
  return createHash("md5").update(r.gameApiKey + r.gameId + r.userId + r.tid + secret).digest("hex");
}

export function rappelValide(r: Rappel, cleApi: string, secret: string): boolean {
  if (!cleApi || !secret || r.gameApiKey !== cleApi || !r.tid || !/^[0-9a-f]{32}$/i.test(r.signature)) return false;
  const a = Buffer.from(signatureAttendue(r, secret), "hex");
  const b = Buffer.from(r.signature.toLowerCase(), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export const jetonValide = (j: string) => /^[0-9a-f]{32}$/.test(j);
