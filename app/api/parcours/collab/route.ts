import { NextResponse } from "next/server";
import { estDebloque } from "@/lib/deblocage";
import { parcoursCollab } from "@/lib/parcours";
import { utilisateur } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

// Parcours complet d'un collaborateur : réservé aux comptes, et débloqué par
// une vidéo publicitaire quand la monétisation est active.
export async function GET(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "connexion requise" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f]{8}$/.test(id)) return NextResponse.json({ error: "identifiant invalide" }, { status: 400 });
  // Fiche gratuite contre une courte vidéo publicitaire (sauf équipe, ou pub désactivée).
  if (!(await estDebloque(user.id, id)).ok) return NextResponse.json({ error: "vidéo à regarder", pub: true }, { status: 402, headers: { "Cache-Control": "private, no-store" } });
  try {
    return NextResponse.json({ periodes: await parcoursCollab(id) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "données indisponibles" }, { status: 503 });
  }
}
