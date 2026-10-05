import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, EDITION, corps, erreur } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const Maj = z.object({
  decision: z.enum(["valider", "rejeter"]).optional(),
  titre: z.string().trim().min(1).max(300).optional(),
  description: z.string().max(50000).optional(),
  type_poste: z.string().max(100).optional(),
  localisation: z.string().max(100).optional(),
  groupe_politique: z.string().max(100).optional(),
  parlementaire_slug: z.string().max(200).optional(),
  publie_le: z.string().max(10).optional(),
  expire_le: z.string().max(10).optional(),
  statut: z.enum(["active", "expiree", "pourvue", "rejetee"]).optional(),
  review_note: z.string().max(2000).optional(),
});

const v = (s: string | undefined) => (!s || !s.trim() ? null : s.trim());

// Validation ou correction d'une offre en revue, et changement de statut
// (pourvue, expirée) des offres publiées.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return avecAdmin(req, async (a) => {
    const { id } = await params;
    const p = Maj.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    const d = p.data;
    const champs: Record<string, unknown> = {};
    if (d.titre !== undefined) champs.titre = d.titre;
    if (d.description !== undefined) champs.description = d.description;
    for (const k of ["type_poste", "localisation", "groupe_politique", "parlementaire_slug", "publie_le", "expire_le", "review_note"] as const) {
      if (d[k] !== undefined) champs[k] = v(d[k]);
    }
    if (d.statut !== undefined) champs.statut = d.statut;
    if (d.decision === "valider") { champs.review_status = "approved"; champs.statut = "active"; }
    if (d.decision === "rejeter") { champs.review_status = "rejected"; champs.statut = "rejetee"; }
    if (Object.keys(champs).length === 0) return erreur(400, "rien à modifier");
    champs.updated_at = new Date().toISOString();
    const { error } = await authAdmin().from("job_offers").update(champs).eq("id", id);
    if (error) throw error;
    await audit(a, "jobs.maj", id, { decision: d.decision, statut: champs.statut ?? null });
    return { ok: true };
  }, EDITION);
}
