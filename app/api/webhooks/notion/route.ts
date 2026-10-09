import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { synchroniserCommuniquesNotion } from "@/lib/notion";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Webhook Notion : synchronisation en temps réel des communiqués.
// Abonnement créé dans le tableau de bord de l'intégration Notion (onglet
// Webhooks), cible cette URL. Le cron de 8 h et le bouton de l'admin restent
// en filet de sécurité.

// Dernier jeton de vérification reçu (il sert aussi de clé de signature HMAC
// des événements ultérieurs — cf. developers.notion.com/reference/webhooks).
// TEMPOURAIRE : exposé par le GET pour la mise en place de l'abonnement ;
// à retirer une fois l'abonnement vérifié.
let jetonVerif: string | null = null;

// Pas plus d'une sync par minute : les webhooks Notion arrivent en rafales
// (création + édition + publication…), et la sync est idempotente.
let derniere = 0;

function signatureValide(req: Request, corps: string): boolean {
  const cle = jetonVerif ?? process.env.NOTION_WEBHOOK_SECRET ?? "";
  if (!cle) return true; // sans clé : accepté (sync idempotente, limitée en rythme)
  const recu = req.headers.get("x-notion-signature") ?? req.headers.get("notion-signature") ?? "";
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
      jetonVerif = jeton;
      return NextResponse.json({ verification_token: jeton });
    }
  } catch { /* corps non JSON : événement normal */ }
  if (!signatureValide(req, corps)) return NextResponse.json({ error: "signature invalide" }, { status: 401 });
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

// Sonde + AFFICHAGE TEMPORAIRE du dernier jeton de vérification reçu :
// ouvre cette URL dans le navigateur après « Renvoyer le jeton » dans Notion,
// copie la valeur et colle-la dans le formulaire de vérification Notion.
// À remplacer par un simple { ok: true } une fois l'abonnement actif.
export async function GET() {
  return NextResponse.json({ ok: true, webhook: "notion", jeton_verification: jetonVerif });
}