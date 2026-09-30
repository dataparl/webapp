import { NextResponse } from "next/server";
import { parcoursElu } from "@/lib/parcours";
import { utilisateur } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

// Historique des collaborateurs d'un élu, toutes chambres : réservé aux comptes.
export async function GET(req: Request) {
  if (!(await utilisateur(req))) return NextResponse.json({ error: "connexion requise" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("personne") ?? "";
  if (!/^[A-Z]?[A-Za-z0-9]{1,20}$/.test(id)) return NextResponse.json({ error: "identifiant invalide" }, { status: 400 });
  try {
    return NextResponse.json({ lignes: await parcoursElu(id) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "données indisponibles" }, { status: 503 });
  }
}
