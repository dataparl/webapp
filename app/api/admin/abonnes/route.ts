import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { desinscrire } from "@/lib/consent";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const PAGE = 50;

export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const u = new URL(req.url).searchParams;
    const page = Math.max(Number(u.get("page") ?? 0) || 0, 0);
    const q = (u.get("q") ?? "").trim().toLowerCase().replace(/[%,()*]/g, "");
    const db = authAdmin();
    let req1 = db.from("newsletter_subscribers")
      .select("id, email, confirmed, subscribed_at, confirmed_at, unsubscribed_at, source, user_id", { count: "exact" })
      .order("subscribed_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
    if (q) req1 = req1.ilike("email", `%${q}%`);
    const { data: abonnes, count, error } = await req1;
    if (error) throw error;
    const emails = (abonnes ?? []).map((x) => x.email as string);
    const { data: alertes } = emails.length
      ? await db.from("alert_subscriptions").select("email, frequence, chambres, types, groupes, elus, active").in("email", emails)
      : { data: [] };
    const parEmail = new Map((alertes ?? []).map((x) => [x.email, x]));
    return {
      total: count ?? 0, page, par_page: PAGE,
      abonnes: (abonnes ?? []).map((x) => ({ ...x, alerte: parEmail.get(x.email) ?? null })),
    };
  });
}

const Desinscription = z.object({ email: z.string().email() });

export async function DELETE(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Desinscription.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    await desinscrire(p.data.email.toLowerCase());
    await audit(a, "abonne.desinscription", p.data.email.toLowerCase());
    return { ok: true };
  });
}
