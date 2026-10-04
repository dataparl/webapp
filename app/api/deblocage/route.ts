import { NextResponse } from "next/server";
import { cibleValide, creerDemande, estDebloque, pubActive } from "@/lib/deblocage";
import { utilisateur } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

// État du déblocage d'une fiche pour le compte connecté (le navigateur
// l'interroge après la vidéo, en attendant le rappel serveur d'AppLixir).
export async function GET(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "connexion requise" }, { status: 401 });
  const cible = new URL(req.url).searchParams.get("id") ?? "";
  if (!cibleValide(cible)) return NextResponse.json({ error: "identifiant invalide" }, { status: 400 });
  const d = await estDebloque(user.id, cible);
  return NextResponse.json({ pub: pubActive(), debloque: d.ok, expire_le: d.expire_le ?? null }, { headers: { "Cache-Control": "private, no-store" } });
}

// Nouvelle demande de vidéo : renvoie le jeton à transmettre au lecteur.
export async function POST(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "connexion requise" }, { status: 401 });
  if (!pubActive()) return NextResponse.json({ error: "publicité désactivée" }, { status: 404 });
  const cible = new URL(req.url).searchParams.get("id") ?? "";
  if (!cibleValide(cible)) return NextResponse.json({ error: "identifiant invalide" }, { status: 400 });
  return NextResponse.json({ jeton: await creerDemande(user.id, cible) }, { headers: { "Cache-Control": "private, no-store" } });
}
