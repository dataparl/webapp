import { randomUUID } from "crypto";
import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { dataAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Fonctions manuelles d'un élu (commissions, groupes, mandats locaux…) :
// créées, modifiées, activées ou supprimées à la main. Elles complètent la
// table `appartenances` synchronisée chaque nuit, sans l'écraser.

const DATE = z.string().trim().max(10).regex(/^$|^\d{4}-\d{2}-\d{2}$/, "date attendue : AAAA-MM-JJ");
const TYPES = ["groupe", "commission", "fonction"] as const;
const Champs = z.object({
  personne_id: z.string().trim().min(1).max(40),
  chambre: z.string().trim().max(20).optional().default(""),
  type: z.enum(TYPES).optional().default("fonction"),
  code: z.string().trim().max(40).optional().default(""),
  libelle: z.string().trim().min(1).max(160),
  sigle: z.string().trim().max(20).optional().default(""),
  fonction: z.string().trim().max(120).optional().default(""),
  debut: DATE.optional().default(""),
  fin: DATE.optional().default(""),
  source: z.string().trim().max(200).optional().default(""),
  actif: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Champs.safeParse(await corps(req));
    if (!p.success) return erreur(400, "fonction invalide (libellé et dates AAAA-MM-JJ requis)");
    const id = `FM-${randomUUID().slice(0, 13)}`;
    const { error } = await dataAdmin().from("fonctions_manuelles").insert({ ...p.data, id, cree_par: a.github, maj_par: a.github });
    if (error) throw error;
    await audit(a, "elus.fonction.ajout", `${p.data.personne_id}|${id}`, { libelle: p.data.libelle });
    return { ok: true, id };
  }, "elus");
}

export async function PUT(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Champs.partial().extend({ id: z.string().trim().min(1).max(40) }).safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    const { id, ...champs } = p.data;
    const { error } = await dataAdmin().from("fonctions_manuelles")
      .update({ ...champs, maj_par: a.github, maj_le: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
    await audit(a, "elus.fonction.modification", id, champs as Record<string, unknown>);
    return { ok: true };
  }, "elus");
}

export async function DELETE(req: Request) {
  return avecAdmin(req, async (a) => {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return erreur(400, "id requis");
    const { error } = await dataAdmin().from("fonctions_manuelles").delete().eq("id", id);
    if (error) throw error;
    await audit(a, "elus.fonction.suppression", id);
    return { ok: true };
  }, "elus");
}
