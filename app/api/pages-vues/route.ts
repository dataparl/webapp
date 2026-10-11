import { NextResponse } from "next/server";
import { utilisateur } from "@/lib/userAuth";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Enregistre une page vue d'un compte connecté (appelé par PageTrace).
// Route seule, sans paramètres d'URL ; purge automatique au-delà de 90 jours.

const CHEMIN = /^\/[a-z0-9/_-]*$/i;

export async function POST(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "non_connecte" }, { status: 401 });

  let corps: { chemin?: string };
  try { corps = await req.json(); } catch {
    return NextResponse.json({ error: "requete_invalide" }, { status: 400 });
  }
  const chemin = corps.chemin ?? "";
  if (!CHEMIN.test(chemin) || chemin.length < 1) {
    return NextResponse.json({ error: "chemin_invalide" }, { status: 400 });
  }

  const db = authAdmin();
  const { error } = await db.from("pages_vues").insert({ user_id: user.id, chemin });
  if (error) return NextResponse.json({ error: "insertion_impossible" }, { status: 500 });

  // Purge : au-delà de 90 jours, effacé (peu coûteux, exécuté à chaque page vue).
  await db.from("pages_vues").delete().lt("le", new Date(Date.now() - 90 * 86400_000).toISOString());

  return NextResponse.json({ ok: true });
}
