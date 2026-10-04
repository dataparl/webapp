import { avecAdmin } from "@/lib/adminRoute";
import { dataAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Journal des téléchargements CSV de DataParl' Sheets (compte + IP),
// pour l'espace équipe.
export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const feuille = (new URL(req.url).searchParams.get("feuille") ?? "").trim().slice(0, 80);
    let requete = dataAdmin()
      .from("telechargements")
      .select("id,cree_le,feuille,lignes,email,ip,user_agent")
      .order("cree_le", { ascending: false })
      .limit(500);
    if (feuille) requete = requete.ilike("feuille", `%${feuille}%`);
    const { data, error } = await requete;
    if (error) throw error;
    return { total: (data ?? []).length, telechargements: data ?? [] };
  }, "comptes");
}
