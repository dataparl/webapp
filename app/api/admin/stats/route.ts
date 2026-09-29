import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/adminAuth";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await checkAdmin(req);
  if (!auth.ok) return NextResponse.json({ error: "non autorisé" }, { status: auth.status });
  const db = authAdmin();
  const depuis = new Date(Date.now() - 7 * 86400_000).toISOString();
  const compte = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const [total, confirmes, actives, envois, consents] = await Promise.all([
    compte(db.from("newsletter_subscribers").select("id", { count: "exact", head: true })),
    compte(db.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("confirmed", true).is("unsubscribed_at", null)),
    compte(db.from("alert_subscriptions").select("id", { count: "exact", head: true }).eq("active", true)),
    compte(db.from("emails").select("id", { count: "exact", head: true }).eq("direction", "out").gte("date", depuis)),
    compte(db.from("communication_consents_history").select("id", { count: "exact", head: true }).gte("created_at", depuis)),
  ]);
  return NextResponse.json({
    github: auth.github,
    abonnes: { total, confirmes, alertes_actives: actives },
    envois_7j: envois,
    consentements_7j: consents,
  });
}
