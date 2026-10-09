import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { synchroniserCommuniquesNotion } from "@/lib/notion";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Webhook Notion : synchronisation en temps réel des communiqués.
// L'abonnement se crée dans le tableau de bord de l'intégration Notion
// (onglet Webhooks), cible https://www.dataparl.fr/api/webhooks/notion
// sur les événements de mise à jour des pages de la base. Le cron de 8 h
// et le bouton de l'admin restent en filet de sécurité.

// Pas plus d'une sync par minute : les webhooks Notion arrivent en rafales
// (création + édition + publication…), et la sync est idempotente.
let derniere = 0;

function signatureValide(req: Request, corps: string): boolean {
  const secret = process.env.NOTION_WEBHOOK_SECRET ?? "";
  if (!secret) return true; // sans secret configuré : accepté (sync idempotente, limitée en rythme)
  const recu = req.headers.get("x-notion-signature") ?? req.headers.get("notion-signature") ?? "";
  if (!recu.startsWith("v1=")) return false;
  const attendu = "v1=" + createHmac("sha256", secret).update(corps).digest("hex");
  return recu.length === attendu.length && timingSafeEqual(Buffer.from(recu), Buffer.from(attendu));
}

export async function POST(req: Request) {
  const corps = await req.text();
  // Vérification de l'abonnement : Notion envoie un jeton et l'active
  // automatiquement si on le renvoie tel quel dans la réponse.
  try {
    const j = JSON.parse(corps) as { verification_token?: string; data?: { verification_token?: string } };
    const jeton = j.verification_token ?? j.data?.verification_token;
    if (jeton) return NextResponse.json({ verification_token: jeton });
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

export async function GET() {
  return NextResponse.json({ ok: true, webhook: "notion" }); // sonde
}