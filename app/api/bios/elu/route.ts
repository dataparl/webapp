import { NextResponse } from "next/server";
import { estDebloque } from "@/lib/deblocage";
import { editionsManuelles } from "@/lib/editionsManuelles";
import { utilisateur } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

// Biographie complète d'un élu (éditeur de l'admin) : réservée aux comptes,
// débloquée par une courte vidéo publicitaire quand la monétisation est active.
export async function GET(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "connexion requise" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("personne") ?? "";
  if (!/^[A-Z]?[A-Za-z0-9]{1,20}$/.test(id)) return NextResponse.json({ error: "identifiant invalide" }, { status: 400 });
  const m = await editionsManuelles(id).catch(() => null);
  if (!m?.bio) return NextResponse.json({ error: "biographie indisponible" }, { status: 404 });
  if (!(await estDebloque(user.id, `bio:${id}`)).ok)
    return NextResponse.json({ error: "vidéo à regarder", pub: true }, { status: 402, headers: { "Cache-Control": "private, no-store" } });
  return NextResponse.json(
    { texte: m.bio.texte, source: m.bio.source || null },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
