import { avecAdmin, erreur } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Enquête utilisateurs (survey.dataparl.fr) : liste des réponses et détail.
// ?id= : la réponse entière (qui, notes, commentaire). Le prénom/nom du compte
// est retrouvé via l'auth au moment de la lecture.
export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const db = authAdmin();
    const id = new URL(req.url).searchParams.get("id");
    if (id) {
      const { data } = await db.from("survey_reponses").select("*").eq("id", id).limit(1);
      const r = data?.[0] as (Record<string, string | number | null> & { user_id: string | null; email: string }) | undefined;
      if (!r) return erreur(404, "réponse introuvable");
      let qui: { prenom: string; nom: string } | null = null;
      if (r.user_id) {
        const { data: u } = await db.auth.admin.getUserById(r.user_id);
        const m = (u.user?.user_metadata ?? {}) as Record<string, string>;
        const complet = String(m.full_name ?? m.name ?? "").trim();
        const nomComplet = complet.includes(" ") ? complet.split(" ").slice(-1)[0] : "";
        qui = { prenom: m.prenom ?? (complet.split(" ").slice(0, -1).join(" ") || ""), nom: m.nom ?? nomComplet };
      }
      return { reponse: r, qui };
    }
    const { data } = await db.from("survey_reponses")
      .select("id, email, user_id, note_experience, note_contenu, note_global, commentaire, cree_le, repondu_le")
      .order("cree_le", { ascending: false })
      .limit(500);
    return { reponses: data ?? [] };
  }, "contenu_enquete");
}
