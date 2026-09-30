import { NextResponse } from "next/server";
import { parcoursCollab } from "@/lib/parcours";
import { utilisateur } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

// Parcours complet d'un collaborateur : réservé aux comptes (comme l'historique des mouvements).
export async function GET(req: Request) {
  if (!(await utilisateur(req))) return NextResponse.json({ error: "connexion requise" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f]{8}$/.test(id)) return NextResponse.json({ error: "identifiant invalide" }, { status: 400 });
  try {
    return NextResponse.json({ periodes: await parcoursCollab(id) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "données indisponibles" }, { status: 503 });
  }
}
