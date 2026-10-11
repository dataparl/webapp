import { avecAdmin, erreur } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Parcours d'un compte connecté : ?email= obligatoire. Réservé aux
// administrateurs (module journal, réservé) — usage : amélioration du site,
// diagnostic d'un compte précis. Données bornées à 90 jours (purge
// automatique dans /api/pages-vues).

type Vue = { le: string; chemin: string };
const compter = (xs: string[]) => Object.entries(xs.reduce<Record<string, number>>((a, x) => { a[x] = (a[x] ?? 0) + 1; return a; }, {}))
  .sort((a, b) => b[1] - a[1]).map(([cle, n]) => ({ cle, n }));

export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const email = (new URL(req.url).searchParams.get("email") ?? "").trim().toLowerCase();
    if (!email || email.length > 200 || !email.includes("@")) return erreur(400, "email requis");

    const db = authAdmin();
    const { data: compte } = await db.from("users").select("id, email, nom, derniere_connexion").eq("email", email).maybeSingle();
    if (!compte) return erreur(404, "aucun compte avec cet email");

    const { data: vues } = await db.from("pages_vues")
      .select("le, chemin").eq("user_id", compte.id)
      .order("le", { ascending: false }).limit(2000);
    const parcours = (vues ?? []) as Vue[];

    return {
      compte,
      total: parcours.length,
      pages: compter(parcours.map((v) => v.chemin)).slice(0, 20),
      jours: compter(parcours.map((v) => v.le.slice(0, 10))),
      parcours: parcours.slice(0, 200), // chronologie détaillée (les 200 plus récentes)
    };
  }, "journal");
}
