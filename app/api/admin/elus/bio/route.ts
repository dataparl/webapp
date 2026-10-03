import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { dataAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Biographie manuelle d'un élu : une seule par personne (upsert sur
// personne_id), activable ou non. Seule une bio « actif » s'affiche sur le site.

const Bio = z.object({
  personne_id: z.string().trim().min(1).max(40),
  texte: z.string().trim().min(1).max(20000),
  source: z.string().trim().max(200).optional().default(""),
  actif: z.boolean().optional().default(false),
});

export async function PUT(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Bio.safeParse(await corps(req));
    if (!p.success) return erreur(400, "bio invalide (texte requis, 20 000 caractères maximum)");
    const { data, error } = await dataAdmin().from("bios").upsert(
      { ...p.data, maj_par: a.github },
      { onConflict: "personne_id" },
    ).select("id").single();
    if (error) throw error;
    await audit(a, "elus.bio", p.data.personne_id, { actif: p.data.actif });
    return { ok: true, id: data.id, actif: p.data.actif };
  }, "elus");
}

// Activer / désactiver sans toucher au texte.
export async function PATCH(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = z.object({ personne_id: z.string().trim().min(1).max(40), actif: z.boolean() }).safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    const { error } = await dataAdmin().from("bios").update({ actif: p.data.actif, maj_par: a.github, maj_le: new Date().toISOString() }).eq("personne_id", p.data.personne_id);
    if (error) throw error;
    await audit(a, "elus.bio", p.data.personne_id, { actif: p.data.actif });
    return { ok: true };
  }, "elus");
}

export async function DELETE(req: Request) {
  return avecAdmin(req, async (a) => {
    const personne_id = new URL(req.url).searchParams.get("personne_id");
    if (!personne_id) return erreur(400, "personne_id requis");
    const { error } = await dataAdmin().from("bios").delete().eq("personne_id", personne_id);
    if (error) throw error;
    await audit(a, "elus.bio.suppression", personne_id);
    return { ok: true };
  }, "elus");
}
