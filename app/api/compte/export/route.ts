import { NextResponse } from "next/server";
import { authAdmin } from "@/lib/supabaseAdmin";
import { normalizeEmail } from "@/lib/tokens";
import { fournisseurs, utilisateur } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

// Droit à la portabilité : toutes les données liées au compte, en JSON.
export async function GET(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "non connecté" }, { status: 401 });
  const email = normalizeEmail(user.email!);
  const db = authAdmin();
  const [abonnement, preferences, alertes, consentements, cles, emails] = await Promise.all([
    db.from("newsletter_subscribers").select("email, confirmed, subscribed_at, confirmed_at, unsubscribed_at, source").eq("email", email),
    db.from("communication_preferences").select("*").eq("email", email),
    db.from("alert_subscriptions").select("frequence, chambres, active, created_at, updated_at").eq("email", email),
    db.from("communication_consents_history").select("action, consent_type, privacy_version, created_at").eq("email", email).order("created_at"),
    db.from("api_keys").select("nom, prefixe, quota_jour, created_at, last_used_at, revoked_at").eq("user_id", user.id),
    db.from("emails").select("subject, date, direction").eq("to_addr", email).order("date"),
  ]);
  const data = {
    genere_le: new Date().toISOString(),
    compte: { email, cree_le: user.created_at, derniere_connexion: user.last_sign_in_at, fournisseurs: fournisseurs(user) },
    abonnement_alertes: abonnement.data ?? [],
    preferences: preferences.data ?? [],
    filtres_alertes: alertes.data ?? [],
    historique_consentements: consentements.data ?? [],
    cles_api: cles.data ?? [],
    emails_recus: emails.data ?? [],
  };
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="dataparl-mes-donnees.json"`,
      "Cache-Control": "no-store",
    },
  });
}
