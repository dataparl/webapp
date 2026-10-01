import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { randomBytes } from "node:crypto";
import { corpsCommunique, dejaServis, envoyerCommunique, MAX_DESTINATAIRES, slugDe, suiviEnvois, type Communique } from "@/lib/communication";
import { LIENS_BASE } from "@/lib/env";
import { gabarit } from "@/lib/gabarit";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const COLS = "id, slug, titre, chapo, corps, statut, publie_le, lien_code, cree_le, maj_le";

// Liste ; ?id= : un communiqué avec son suivi (envois, ouvertures, clics).
export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const db = authAdmin();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      const { data } = await db.from("communiques").select("id, slug, titre, statut, publie_le, maj_le, lien_code").order("maj_le", { ascending: false });
      return { communiques: data ?? [] };
    }
    const { data: c } = await db.from("communiques").select(COLS).eq("id", id).maybeSingle();
    if (!c) return erreur(404, "communiqué introuvable");
    const [envois, clics] = await Promise.all([
      suiviEnvois("communique", id),
      c.lien_code ? db.from("liens_clics").select("id", { count: "exact", head: true }).eq("code", c.lien_code).neq("appareil", "robot") : Promise.resolve({ count: 0 }),
    ]);
    return { communique: c, envois, clics: clics.count ?? 0, lien: c.lien_code ? `${LIENS_BASE}/${c.lien_code}` : null };
  }, "communication");
}

const Texte = z.object({ titre: z.string().trim().min(3).max(160), chapo: z.string().trim().max(600).default(""), corps: z.string().trim().max(20000).default("") });
const Action = z.discriminatedUnion("action", [
  Texte.extend({ action: z.literal("creer") }),
  Texte.extend({ action: z.literal("enregistrer"), id: z.string().uuid() }),
  Texte.extend({ action: z.literal("apercu") }),
  z.object({ action: z.literal("publier"), id: z.string().uuid(), publie: z.boolean() }),
  z.object({ action: z.literal("test"), id: z.string().uuid() }),
  z.object({ action: z.literal("envoyer"), id: z.string().uuid(), contacts: z.array(z.string().uuid()).max(5000).optional() }),
  z.object({ action: z.literal("supprimer"), id: z.string().uuid() }),
]);

export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Action.safeParse(await corps(req));
    if (!p.success) return erreur(400, "vérifie le titre (3 caractères au moins) et le texte");
    const d = p.data;
    const db = authAdmin();
    if (d.action === "apercu") {
      const { html } = corpsCommunique(d, "https://www.dataparl.fr/presse/communiques");
      return { html: gabarit({ titre: d.titre, corpsHtml: html, pied: "Aperçu : le pied réel porte le lien de désinscription du carnet presse." }) };
    }
    if (d.action === "creer") {
      let slug = slugDe(d.titre);
      const { data: pris } = await db.from("communiques").select("slug").like("slug", `${slug}%`);
      if ((pris ?? []).some((x) => x.slug === slug)) slug = `${slug.slice(0, 62)}-${randomBytes(2).toString("hex")}`;
      const { data, error } = await db.from("communiques").insert({ slug, titre: d.titre, chapo: d.chapo, corps: d.corps, cree_par: a.userId }).select("id").single();
      if (error) throw error;
      await audit(a, "communique.creation", d.titre);
      return { ok: true, id: data.id };
    }
    const { data: c } = await db.from("communiques").select(COLS).eq("id", d.id).maybeSingle();
    if (!c) return erreur(404, "communiqué introuvable");
    if (d.action === "enregistrer") {
      await db.from("communiques").update({ titre: d.titre, chapo: d.chapo, corps: d.corps, maj_le: new Date().toISOString() }).eq("id", d.id);
      return { ok: true };
    }
    if (d.action === "publier") {
      await db.from("communiques").update({ statut: d.publie ? "publie" : "brouillon", publie_le: d.publie ? (c.publie_le ?? new Date().toISOString()) : c.publie_le }).eq("id", d.id);
      await audit(a, d.publie ? "communique.publication" : "communique.depublication", c.titre as string);
      return { ok: true };
    }
    if (d.action === "supprimer") {
      await db.from("communiques").delete().eq("id", d.id);
      await audit(a, "communique.suppression", c.titre as string);
      return { ok: true };
    }
    if (d.action === "test") {
      const r = await envoyerCommunique(a, c as Communique, [{ email: a.email, prenom: "" }], true);
      return r.envoyes ? { ok: true, a: a.email } : erreur(502, "l'envoi de test a échoué");
    }
    // Envoi : le lien du communiqué mène à sa page publique, il doit donc être publié.
    if (c.statut !== "publie") return erreur(400, "publie le communiqué avant de l'envoyer : le lien « lire en ligne » mène à sa page publique");
    let q = db.from("presse_contacts").select("id, email, prenom").eq("actif", true).is("desinscrit_le", null);
    if (d.contacts?.length) q = q.in("id", d.contacts);
    const { data: contacts } = await q.order("email").limit(5000);
    if (!contacts?.length) return erreur(400, "aucun destinataire actif dans le carnet presse");
    // Personne ne reçoit deux fois le même communiqué ; au-delà du plafond, l'envoi se poursuit par lots.
    const servis = await dejaServis("communique", { ref: d.id });
    const aServir = contacts.filter((x) => !servis.has((x.email as string).toLowerCase()));
    if (!aServir.length) return erreur(409, "tous les contacts actifs ont déjà reçu ce communiqué");
    const lot = aServir.slice(0, MAX_DESTINATAIRES);
    const r = await envoyerCommunique(a, c as Communique, lot.map((x) => ({ email: x.email as string, prenom: x.prenom as string })));
    await audit(a, "communique.envoi", c.titre as string, r);
    return { ok: true, ...r, restants: aServir.length - lot.length };
  }, "communication");
}
