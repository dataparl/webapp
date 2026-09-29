import { NextResponse } from "next/server";
import { z } from "zod";
import { logConsent } from "@/lib/consent";
import { authAdmin } from "@/lib/supabaseAdmin";
import { normalizeEmail } from "@/lib/tokens";
import { utilisateur } from "@/lib/userAuth";

const Corps = z.object({
  actives: z.boolean(),
  frequence: z.enum(["quotidienne", "hebdomadaire"]),
  chambres: z.array(z.enum(["assemblee", "senat", "europarl"])).min(1).max(3),
});

// L'adresse d'un compte est déjà vérifiée (code email ou fournisseur) :
// l'activation depuis le compte vaut confirmation, sans second email.
export async function PUT(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "non connecté" }, { status: 401 });
  const parsed = Corps.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "choisis au moins une chambre" }, { status: 400 });
  const { actives, frequence, chambres } = parsed.data;
  const email = normalizeEmail(user.email!);
  const db = authAdmin();
  const now = new Date().toISOString();

  const { data: subs } = await db.from("alert_subscriptions").select("id").eq("email", email).order("created_at", { ascending: false });
  if (subs?.length) {
    await db.from("alert_subscriptions").update({ frequence, chambres, active: actives, updated_at: now }).eq("id", subs[0].id);
    if (subs.length > 1) await db.from("alert_subscriptions").delete().in("id", subs.slice(1).map((s) => s.id));
  } else {
    await db.from("alert_subscriptions").insert({ email, frequence, chambres, active: actives });
  }
  await db.from("communication_preferences").upsert({ email, alertes_enabled: actives, updated_at: now });
  if (actives) {
    await db.from("newsletter_subscribers").upsert(
      { email, user_id: user.id, confirmed: true, confirmed_at: now, unsubscribed_at: null, confirm_token_hash: null, confirm_expires_at: null, source: "compte" },
      { onConflict: "email" },
    );
  } else {
    await db.from("newsletter_subscribers").update({ unsubscribed_at: now }).eq("email", email);
  }
  await logConsent(email, actives ? "confirm" : "unsubscribe", "alertes");
  return NextResponse.json({ ok: true });
}
