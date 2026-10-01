import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Carnet d'adresses presse.
export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const { data, error } = await authAdmin().from("presse_contacts").select("*").order("media").order("nom");
    if (error) throw error;
    return { contacts: data ?? [] };
  }, "communication");
}

const Contact = z.object({
  prenom: z.string().trim().max(80).default(""), nom: z.string().trim().max(80).default(""), media: z.string().trim().max(120).default(""),
  email: z.string().trim().toLowerCase().email().max(254), notes: z.string().trim().max(500).default(""),
});
const Ajout = z.union([Contact, z.object({ lot: z.string().max(60000) })]);

// Ajout d'un contact, ou d'un lot collé : une ligne par contact, « prénom;nom;média;email ».
export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Ajout.safeParse(await corps(req));
    if (!p.success) return erreur(400, "adresse email invalide");
    const db = authAdmin();
    let lignes: z.infer<typeof Contact>[] = [];
    let ignorees = 0;
    if ("lot" in p.data) {
      for (const l of p.data.lot.split(/\r?\n/).map((x) => x.trim()).filter(Boolean)) {
        const c = l.split(/[;\t]/).map((x) => x.trim());
        const email = c.find((x) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x));
        const reste = c.filter((x) => x !== email);
        const ok = Contact.safeParse({ prenom: reste[0] ?? "", nom: reste[1] ?? "", media: reste[2] ?? "", email });
        if (ok.success) lignes.push(ok.data); else ignorees += 1;
      }
      lignes = [...new Map(lignes.map((l) => [l.email, l])).values()].slice(0, 2000);
    } else lignes = [p.data];
    if (!lignes.length) return erreur(400, "aucune ligne exploitable (format : prénom;nom;média;email)");
    const { data, error } = await db.from("presse_contacts").upsert(lignes, { onConflict: "email", ignoreDuplicates: true }).select("id");
    if (error) throw error;
    await audit(a, "presse.ajout", undefined, { ajoutes: data?.length ?? 0 });
    return { ok: true, ajoutes: data?.length ?? 0, deja: lignes.length - (data?.length ?? 0), ignorees };
  }, "communication");
}

const Maj = Contact.partial().extend({ id: z.string().uuid(), actif: z.boolean().optional() });

export async function PATCH(req: Request) {
  return avecAdmin(req, async () => {
    const p = Maj.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    const { id, ...champs } = p.data;
    const db = authAdmin();
    if (champs.actif === true) {
      const { data: c } = await db.from("presse_contacts").select("desinscrit_le").eq("id", id).maybeSingle();
      if (c?.desinscrit_le) return erreur(409, "cette personne s'est désinscrite : elle ne peut pas être réactivée");
    }
    const { error } = await db.from("presse_contacts").update(champs).eq("id", id);
    if (error) return erreur(409, "cette adresse existe déjà");
    return { ok: true };
  }, "communication");
}

export async function DELETE(req: Request) {
  return avecAdmin(req, async (a) => {
    const id = new URL(req.url).searchParams.get("id") ?? "";
    if (!z.string().uuid().safeParse(id).success) return erreur(400, "requête invalide");
    await authAdmin().from("presse_contacts").delete().eq("id", id);
    await audit(a, "presse.suppression", id);
    return { ok: true };
  }, "communication");
}
