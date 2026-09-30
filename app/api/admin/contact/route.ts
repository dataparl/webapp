import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { EXPEDITEURS } from "@/lib/env";
import { authAdmin } from "@/lib/supabaseAdmin";
import { envoyerDepuisWebmail } from "@/lib/webmail";

export const dynamic = "force-dynamic";

const STATUTS = ["nouveau", "en_cours", "traite", "spam"] as const;

export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const statut = new URL(req.url).searchParams.get("statut");
    let q = authAdmin().from("contact_messages")
      .select("id, prenom, nom, email, sujet, message, statut, created_at, repondu_at, note_admin, user_id")
      .order("created_at", { ascending: false }).limit(200);
    if (statut && (STATUTS as readonly string[]).includes(statut)) q = q.eq("statut", statut);
    const { data, error } = await q;
    if (error) throw error;
    return { messages: data };
  });
}

const Maj = z.object({ id: z.string().uuid(), statut: z.enum(STATUTS).optional(), note_admin: z.string().max(2000).optional() });

export async function PATCH(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Maj.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    const { id, ...champs } = p.data;
    await authAdmin().from("contact_messages").update(champs).eq("id", id);
    await audit(a, "contact.maj", id, champs);
    return { ok: true };
  });
}

const Reponse = z.object({ id: z.string().uuid(), texte: z.string().trim().min(1).max(20000), from: z.string().email().optional() });

// Répond à un message de contact depuis une adresse @dataparl.fr ;
// la réponse est rangée dans « Envoyés » de la webmail.
export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Reponse.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    const db = authAdmin();
    const { data: m } = await db.from("contact_messages").select("prenom, email, sujet, message, created_at").eq("id", p.data.id).maybeSingle();
    if (!m) return erreur(404, "message introuvable");
    const cite = (m.message as string).split("\n").map((l) => `> ${l}`).join("\n");
    const envoi = await envoyerDepuisWebmail(a, {
      from: p.data.from ?? EXPEDITEURS[0],
      to: [m.email as string],
      subject: `Re: ton message à DataParl' (${m.sujet})`,
      text: `${p.data.texte}\n\n${new Date(m.created_at as string).toLocaleDateString("fr-FR")}, ${m.prenom} a écrit :\n${cite}`,
    });
    if (!envoi.ok) return erreur(502, envoi.error);
    await db.from("contact_messages").update({ statut: "traite", repondu_at: new Date().toISOString() }).eq("id", p.data.id);
    await audit(a, "contact.reponse", p.data.id);
    return { ok: true };
  });
}
