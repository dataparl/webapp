import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { synchroniserCommuniquesNotion } from "@/lib/notion";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Webhook Notion : synchronisation en temps réel des communiqués.
// Abonnement créé dans le tableau de bord de l'intégration Notion (onglet
// Webhooks). Le cron de 8 h et le bouton de l'admin restent en filet de sécurité.
// Le jeton de vérification (one-time) et la clé de signature HMAC sont gardés
// dans la table cle_valeur : le POST (Notion) et le GET (navigateur) peuvent
// tomber sur des instances serveur différentes sur Vercel.

const CLE_JETON = "notion_webhook_verification_token";

async function garderJeton(jeton: string) {
  await authAdmin().from("cle_valeur").upsert({ cle: CLE_JETON, valeur: jeton });
}
async function lireJeton(): Promise<string | null> {
  const { data } = await authAdmin().from("cle_valeur").select("valeur").eq("cle", CLE_JETON).maybeSingle();
  return (data?.valeur as string) ?? null;
}

// Pas plus d'une sync par minute : les webhooks Notion arrivent en rafales
// (création + édition + publication…), et la sync est idempotente.
let derniere = 0;

async function signatureValide(req: Request, corps: string): Promise<boolean> {
  const cle = (await lireJeton()) ?? process.env.NOTION_WEBHOOK_SECRET ?? "";
  if (!cle) return true; // sans clé : accepté (sync idempotente, limitée en rythme)
  const recu = req.headers.get("x-notion-signature") ?? "";
  if (!recu.startsWith("sha256=")) return false;
  const attendu = "sha256=" + createHmac("sha256", cle).update(corps).digest("hex");
  return recu.length === attendu.length && timingSafeEqual(Buffer.from(recu), Buffer.from(attendu));
}

export async function POST(req: Request) {
  const corps = await req.text();
  // Vérification de l'abonnement : Notion envoie un one-time verification_token,
  // à coller dans le formulaire de l'onglet Webhooks pour activer l'abonnement.
  try {
    const j = JSON.parse(corps) as { verification_token?: string; data?: { verification_token?: string } };
    const jeton = j.verification_token ?? j.data?.verification_token;
    if (jeton) {
      await garderJeton(jeton);
      return NextResponse.json({ verification_token: jeton });
    }
  } catch { /* corps non JSON : événement normal */ }
  if (!(await signatureValide(req, corps))) return NextResponse.json({ error: "signature invalide" }, { status: 401 });
  const maintenant = Date.now();
  if (maintenant - derniere < 60_000) return NextResponse.json({ ok: true, ignore: "sync trop récente" });
  derniere = maintenant;
  try {
    const r = await synchroniserCommuniquesNotion(authAdmin());
    return NextResponse.json({ ok: r.erreurs.length === 0, ...r });
  } catch (e) {
    return NextResponse.json({ ok: false, erreur: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

// Sonde : confirme que la route répond (le jeton de vérification, gardé en
// base, n'est jamais exposé — l'abonnement est déjà vérifié).
export async function GET() {
  return NextResponse.json({ ok: true, webhook: "notion" });
}