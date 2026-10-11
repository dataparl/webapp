import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { authAdmin } from "@/lib/supabaseAdmin";

// Abonnement WhatsApp au DataParl' Daily (page /daily/wa). Seul le numéro
// est demandé : pas de compte, pas de mot de passe. On stocke le numéro et le
// hash SHA-256 d'un jeton de désinscription à un clic (même modèle que les
// jetons de préférences des alertes email).
const TEL = /^\+?\d{8,15}$/;
const JETON = /^[0-9a-f]{40}$/;
const hash = (t: string) => createHash("sha256").update(t).digest("hex");

export async function POST(req: Request) {
  const { tel, consent } = (await req.json().catch(() => ({}))) as { tel?: string; consent?: boolean };
  const numero = String(tel ?? "").replace(/[\s.-]/g, "").replace(/^\+/, "");
  if (!TEL.test(numero)) return NextResponse.json({ error: "Numéro invalide." }, { status: 400 });
  if (!consent) return NextResponse.json({ error: "Consentement requis." }, { status: 400 });
  const jeton = randomBytes(20).toString("hex");
  const { error } = await authAdmin().from("wa_abonnes").upsert(
    { tel: numero, jeton_hash: hash(jeton), actif: true }, { onConflict: "tel" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, desinscription: `/daily/wa?desinscription=${jeton}` });
}

// Désinscription en un clic : /api/chaine-wa?desinscription=<jeton>.
export async function GET(req: Request) {
  const jeton = new URL(req.url).searchParams.get("desinscription") ?? "";
  if (!JETON.test(jeton)) return NextResponse.json({ error: "Lien invalide." }, { status: 400 });
  const { data, error } = await authAdmin().from("wa_abonnes")
    .update({ actif: false }).eq("jeton_hash", hash(jeton)).eq("actif", true).select("tel");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, desinscrit: !!data?.length });
}
