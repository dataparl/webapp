import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Revalidation à la demande : appelée par le workflow « Synchro Supabase » du
// dépôt collaborateurs, une fois les données du jour poussées vers Supabase
// (run de 07:47). Les fiches individuelles restent en ISR 24 h (la valeur
// export const revalidate = 86400) ; on ne rafraîchit ici que les pages
// « vitrines » dont le contenu du jour change réellement — c'est peu de CPU
// et le reste du site reste servi depuis le cache.

const CHEMINS = [
  "/",
  "/an",
  "/senat",
  "/pe",
  "/mouvements",
  "/mouvements/assemblee",
  "/mouvements/senat",
  "/mouvements/europarl",
  "/daily",
  "/collab",
  "/parlementaires",
  "/gouv",
  "/senatoriales2026",
];

// Comparaison en temps constant (le secret ne fuit pas par le temps de réponse).
function secretValide(fourni: string | null, attendu: string): boolean {
  if (!fourni || fourni.length !== attendu.length) return false;
  let diff = 0;
  for (let i = 0; i < attendu.length; i++) {
    diff |= fourni.charCodeAt(i) ^ attendu.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const noStore = { "Cache-Control": "no-store" };
  if (!secret || !secretValide(req.headers.get("x-revalidate-secret"), secret)) {
    return NextResponse.json({ ok: false, erreur: "secret invalide" }, { status: 401, headers: noStore });
  }
  for (const chemin of CHEMINS) revalidatePath(chemin);
  return NextResponse.json({ ok: true, revalides: CHEMINS.length }, { headers: noStore });
}

// GET discret : facilite le diagnostic sans exposer rien de sensible.
export async function GET() {
  return NextResponse.json(
    { ok: true, usage: "POST avec en-tête x-revalidate-secret" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
