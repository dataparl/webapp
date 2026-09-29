import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { logConsent, nouveauJetonPreferences } from "@/lib/consent";
import { authAdmin } from "@/lib/supabaseAdmin";
import { sha256 } from "@/lib/tokens";

export const metadata: Metadata = { title: "Confirmation", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// La confirmation se fait par un bouton (POST), jamais à l'ouverture du lien :
// les antivirus de messagerie ouvrent les liens et confirmeraient à la place
// de la personne.

async function abonneDepuisJeton(token: string) {
  if (!token || token.length > 100) return null;
  const { data } = await authAdmin()
    .from("newsletter_subscribers")
    .select("id, email, confirm_expires_at")
    .eq("confirm_token_hash", await sha256(token))
    .maybeSingle();
  if (!data || !data.confirm_expires_at || new Date(data.confirm_expires_at) < new Date()) return null;
  return data as { id: string; email: string };
}

async function confirmer(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  const abonne = await abonneDepuisJeton(token);
  if (!abonne) redirect("/alertes/confirmation?etat=invalide");
  const db = authAdmin();
  const now = new Date().toISOString();
  await db.from("newsletter_subscribers").update({
    confirmed: true, confirmed_at: now, unsubscribed_at: null, confirm_token_hash: null, confirm_expires_at: null,
  }).eq("id", abonne.id);
  // Les derniers filtres choisis remplacent les précédents.
  const { data: attente } = await db.from("alert_subscriptions").select("id").eq("email", abonne.email).eq("active", false)
    .order("created_at", { ascending: false }).limit(1);
  if (attente?.length) {
    await db.from("alert_subscriptions").delete().eq("email", abonne.email).neq("id", attente[0].id);
    await db.from("alert_subscriptions").update({ active: true, updated_at: now }).eq("id", attente[0].id);
  }
  await db.from("communication_preferences").upsert({ email: abonne.email, alertes_enabled: true, updated_at: now });
  await logConsent(abonne.email, "confirm", "alertes");
  const prefs = await nouveauJetonPreferences(abonne.email);
  redirect(`/alertes/confirmation?etat=ok&id=${encodeURIComponent(prefs)}`);
}

export default async function Confirmation({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { token, etat, id } = await searchParams;

  if (etat === "ok") {
    return (
      <div className="card">
        <h1>Inscription confirmée</h1>
        <p>C&apos;est fait, tu recevras les alertes DataParl&apos;. Chaque email contiendra un lien pour régler tes préférences ou te désinscrire.</p>
        {id && <a className="btn" href={`/preferences?id=${encodeURIComponent(id)}`}>Régler mes préférences</a>}
      </div>
    );
  }
  if (etat === "invalide" || !token || !(await abonneDepuisJeton(token))) {
    return (
      <div className="card">
        <h1>Lien invalide ou expiré</h1>
        <p>Ce lien de confirmation n&apos;est plus valable (il expire au bout de 48 heures). Vous pouvez recommencer l&apos;inscription.</p>
        <a className="btn" href="/alertes">Recommencer</a>
      </div>
    );
  }
  return (
    <div className="card">
      <h1>Confirmez votre inscription</h1>
      <p>Un dernier clic pour recevoir les alertes sur les mouvements de collaborateurs parlementaires.</p>
      <form action={confirmer}>
        <input type="hidden" name="token" value={token} />
        <button type="submit">Confirmer mon inscription</button>
      </form>
    </div>
  );
}
