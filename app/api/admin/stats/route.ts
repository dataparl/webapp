import { avecAdmin } from "@/lib/adminRoute";
import { dataQuery } from "@/lib/data";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Run = { run_id: string; chambre: string; date: string; statut: string; n_affectations: number; n_arrivees: number; n_departs: number; n_transferts: number; message: string };

export async function GET(req: Request) {
  return avecAdmin(req, async (a) => {
    const db = authAdmin();
    const depuis = new Date(Date.now() - 7 * 86400_000).toISOString();
    const compte = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
    const [total, confirmes, actives, envois, consents, contacts, nonLus, cles, comptes] = await Promise.all([
      compte(db.from("newsletter_subscribers").select("id", { count: "exact", head: true })),
      compte(db.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("confirmed", true).is("unsubscribed_at", null)),
      compte(db.from("alert_subscriptions").select("id", { count: "exact", head: true }).eq("active", true)),
      compte(db.from("emails").select("id", { count: "exact", head: true }).eq("direction", "out").gte("date", depuis)),
      compte(db.from("communication_consents_history").select("id", { count: "exact", head: true }).gte("created_at", depuis)),
      compte(db.from("contact_messages").select("id", { count: "exact", head: true }).eq("statut", "nouveau")),
      compte(db.from("emails").select("id", { count: "exact", head: true }).eq("folder", "inbox").eq("read", false)),
      compte(db.from("api_keys").select("id", { count: "exact", head: true }).is("revoked_at", null)),
      compte(db.from("profiles").select("id", { count: "exact", head: true })),
    ]);
    let runs: Run[] = [];
    try {
      runs = (await dataQuery<Run>("runs", new URLSearchParams({ select: "*", order: "date.desc,run_id.desc", limit: "10" }), 0)).rows;
    } catch { /* données indisponibles : le tableau de bord s'affiche quand même */ }
    return {
      github: a.github,
      comptes,
      abonnes: { total, confirmes, alertes_actives: actives },
      envois_7j: envois,
      consentements_7j: consents,
      contacts_nouveaux: contacts,
      emails_non_lus: nonLus,
      cles_actives: cles,
      runs,
    };
  });
}
