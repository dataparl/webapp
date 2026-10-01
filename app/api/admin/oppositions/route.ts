import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, EDITION, corps, erreur } from "@/lib/adminRoute";
import { cleNom } from "@/lib/format";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Oppositions RGPD : l'email déduit d'un(e) collaborateur(rice) n'est plus
// affiché ni exporté. La clé est celle du pipeline (tokens normalisés triés).

export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const { data, error } = await authAdmin().from("opposition_emails").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return { oppositions: data };
  }, EDITION);
}

const Ajout = z.object({
  chambre: z.enum(["assemblee", "senat", "europarl"]),
  prenom: z.string().trim().min(1).max(80),
  nom: z.string().trim().min(1).max(80),
  motif: z.string().trim().max(500).optional(),
});

export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Ajout.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    const collab_cle = cleNom(p.data.prenom, p.data.nom);
    if (!collab_cle) return erreur(400, "nom invalide");
    await authAdmin().from("opposition_emails").upsert({ chambre: p.data.chambre, collab_cle, motif: p.data.motif ?? null });
    await audit(a, "opposition.ajout", `${p.data.chambre}|${collab_cle}`);
    return { ok: true, collab_cle };
  }, EDITION);
}

const Retrait = z.object({ chambre: z.string(), collab_cle: z.string().min(1) });

export async function DELETE(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Retrait.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    await authAdmin().from("opposition_emails").delete().eq("chambre", p.data.chambre).eq("collab_cle", p.data.collab_cle);
    await audit(a, "opposition.retrait", `${p.data.chambre}|${p.data.collab_cle}`);
    return { ok: true };
  }, EDITION);
}
