import { NextResponse } from "next/server";
import { verifierSvix } from "@/lib/crypto";
import { secret } from "@/lib/env";
import { enregistrerEvenement, importerRecu } from "@/lib/webmail";

export const dynamic = "force-dynamic";

// Webhook Resend (signé Svix) : email.received pour la webmail, et les
// événements d'envoi (email.delivered, email.bounced, email.complained…).
export async function POST(req: Request) {
  const brut = await req.text();
  if (!verifierSvix(brut, req.headers, secret("RESEND_WEBHOOK_SECRET"))) {
    return NextResponse.json({ error: "signature invalide" }, { status: 401 });
  }
  let evt: { type?: string; data?: { email_id?: string } };
  try { evt = JSON.parse(brut); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }
  const type = evt.type ?? "";
  const id = evt.data?.email_id;
  if (!id) return NextResponse.json({ ok: true, ignore: true });
  try {
    if (type === "email.received") await importerRecu(id);
    else if (type.startsWith("email.")) await enregistrerEvenement(type, id, evt.data);
  } catch (e) {
    console.error("webhook resend", type, e);
    return NextResponse.json({ error: "traitement impossible" }, { status: 500 }); // Resend réessaiera
  }
  return NextResponse.json({ ok: true });
}
