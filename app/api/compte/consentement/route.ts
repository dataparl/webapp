import { NextResponse } from "next/server";
import { logConsent } from "@/lib/consent";
import { normalizeEmail } from "@/lib/tokens";
import { utilisateur } from "@/lib/userAuth";

// Journalise l'acceptation des CGU et de la politique de données lors de la
// création d'un compte (case cochée sur la page de connexion).
export async function POST(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "non connecté" }, { status: 401 });
  await logConsent(normalizeEmail(user.email!), "subscribe", "compte");
  return NextResponse.json({ ok: true });
}
