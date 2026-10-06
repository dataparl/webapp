import { createHash } from "crypto";
import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, EDITION, corps, erreur } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const COLONNES = "id,titre,description,type_poste,localisation,groupe_politique,parlementaire_slug,source_url,source_connector,source_raw,publie_le,expire_le,statut,review_status,review_note,match_confidence,created_at,updated_at";

export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const vue = new URL(req.url).searchParams.get("vue") ?? "revue";
    let q = authAdmin().from("job_offers").select(COLONNES);
    if (vue === "actives") q = q.eq("review_status", "approved").eq("statut", "active").order("publie_le", { ascending: false, nullsFirst: false }).limit(200);
    else if (vue === "archivees") q = q.in("statut", ["expiree", "pourvue", "rejetee"]).order("updated_at", { ascending: false }).limit(100);
    else q = q.eq("review_status", "pending").order("created_at", { ascending: true }).limit(200);
    const { data, error } = await q;
    if (error) throw error;
    return { offres: data ?? [] };
  }, EDITION);
}

const Soumission = z.object({
  titre: z.string().trim().min(1).max(300),
  description: z.string().max(50000).default(""),
  source_url: z.string().url().max(1000),
  type_poste: z.string().max(100).optional(),
  localisation: z.string().max(100).optional(),
  groupe_politique: z.string().max(100).optional(),
  parlementaire_slug: z.string().max(200).optional(),
  publie_le: z.string().max(10).optional(),
  expire_le: z.string().max(10).optional(),
  source_connector: z.string().max(50).default("manuel"),
  source_raw: z.string().max(100000).optional(),
});

const v = (s: string | undefined) => (!s || !s.trim() ? null : s.trim());

// Empreinte stable : deux fois la même offre (même titre, même source) ne crée
// jamais de doublon, quel que soit le canal d'entrée

export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Soumission.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    const d = p.data;
    const empreinte = createHash("sha256").update(d.titre.toLowerCase().replace(/\s+/g, " ").trim() + "|" + d.source_url).digest("hex");
    const { error } = await authAdmin().from("job_offers").insert({
      fingerprint: empreinte,
      titre: d.titre,
      description: d.description,
      source_url: d.source_url,
      type_poste: v(d.type_poste),
      localisation: v(d.localisation),
      groupe_politique: v(d.groupe_politique),
      parlementaire_slug: v(d.parlementaire_slug),
      publie_le: v(d.publie_le),
      expire_le: v(d.expire_le),
      source_connector: d.source_connector,
      source_raw: v(d.source_raw),
    });
    if (error) {
      if (error.code === "23505") return erreur(409, "offre déjà enregistrée (doublon)");
      throw error;
    }
    await audit(a, "jobs.soumission", undefined, { titre: d.titre, source: d.source_connector });
    return { ok: true };
  }, EDITION);
}
