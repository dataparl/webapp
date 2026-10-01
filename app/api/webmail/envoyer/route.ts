import { z } from "zod";
import { avecAdmin, EQUIPE, corps, erreur } from "@/lib/adminRoute";
import { boitesDe, expediteursDe, peutVoir } from "@/lib/boites";
import { authAdmin } from "@/lib/supabaseAdmin";
import { envoyerDepuisWebmail } from "@/lib/webmail";

export const dynamic = "force-dynamic";

const liste = z.array(z.string().trim().email()).max(20);

const Envoi = z.object({
  from: z.string().email(),
  to: liste.min(1),
  cc: liste.optional(),
  subject: z.string().trim().min(1).max(300),
  text: z.string().min(1).max(100_000),
  reponse_a: z.string().uuid().optional(), // id de l'email auquel on répond
});

export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Envoi.safeParse(await corps(req));
    if (!p.success) return erreur(400, "vérifie les destinataires, l'objet et le message");
    if (!(await expediteursDe(a)).includes(p.data.from.toLowerCase())) return erreur(403, "adresse d'expédition non autorisée pour ton compte");
    let inReplyTo: string | null = null;
    if (p.data.reponse_a) {
      const { data } = await authAdmin().from("emails").select("message_id, to_addr, cc_addr, from_addr").eq("id", p.data.reponse_a).maybeSingle();
      if (data && peutVoir(boitesDe(a), data)) inReplyTo = (data.message_id as string | null) ?? null;
    }
    const r = await envoyerDepuisWebmail(a, { ...p.data, inReplyTo }, await expediteursDe(a));
    if (!r.ok) return erreur(502, r.error);
    return { ok: true };
  }, EQUIPE);
}
