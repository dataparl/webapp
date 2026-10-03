import { randomUUID } from "crypto";
import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { dataAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Mandats manuels d'un élu : créés, modifiés, activés ou supprimés à la main.
// Ils complètent la table `mandats` synchronisée chaque nuit, sans l'écraser.

const DATE = z.string().trim().max(10).regex(/^$|^\d{4}-\d{2}-\d{2}$/, "date attendue : AAAA-MM-JJ");
const Champs = z.object({
  personne_id: z.string().trim().min(1).max(40),
  chambre: z.string().trim().max(20).optional().default(""),
  elu_id: z.string().trim().max(20).optional().default(""),
  libelle: z.string().trim().min(1).max(120),
  circonscription: z.string().trim().max(120).optional().default(""),
  debut: DATE.optional().default(""),
  fin: DATE.optional().default(""),
  cause_fin: z.string().trim().max(120).optional().default(""),
  source: z.string().trim().max(200).optional().default(""),
  actif: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Champs.safeParse(await corps(req));
    if (!p.success) return erreur(400, "mandat invalide (libellé et dates AAAA-MM-JJ requis)");
    const id = `MM-${randomUUID().slice(0, 13)}`;
    const { error } = await dataAdmin().from("mandats_manuels").insert({ ...p.data, id, cree_par: a.github, maj_par: a.github });
    if (error) throw error;
    await audit(a, "elus.mandat.ajout", `${p.data.personne_id}|${id}`, { libelle: p.data.libelle });
    return { ok: true, id };
  }, "elus");
}

export async function PUT(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Champs.partial().extend({ id: z.string().trim().min(1).max(40) }).safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    const { id, ...champs } = p.data;
    const { error } = await dataAdmin().from("mandats_manuels")
      .update({ ...champs, maj_par: a.github, maj_le: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
    await audit(a, "elus.mandat.modification", id, champs as Record<string, unknown>);
    return { ok: true };
  }, "elus");
}

export async function DELETE(req: Request) {
  return avecAdmin(req, async (a) => {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return erreur(400, "id requis");
    const { error } = await dataAdmin().from("mandats_manuels").delete().eq("id", id);
    if (error) throw error;
    await audit(a, "elus.mandat.suppression", id);
    return { ok: true };
  }, "elus");
}
