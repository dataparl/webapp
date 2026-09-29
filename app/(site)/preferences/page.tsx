import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { emailDepuisJeton, logConsent } from "@/lib/consent";
import { authAdmin } from "@/lib/supabaseAdmin";

export const metadata: Metadata = { title: "Mes préférences", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const CHAMBRES = [
  { v: "assemblee", l: "Assemblée nationale" },
  { v: "senat", l: "Sénat" },
  { v: "europarl", l: "Parlement européen" },
] as const;

async function enregistrer(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const email = await emailDepuisJeton(id);
  if (!email) redirect("/preferences?etat=invalide");
  const actif = formData.get("alertes") === "on";
  const frequence = formData.get("frequence") === "hebdomadaire" ? "hebdomadaire" : "quotidienne";
  const chambres = formData.getAll("chambres").map(String).filter((c) => CHAMBRES.some((x) => x.v === c));
  const db = authAdmin();
  const now = new Date().toISOString();
  await db.from("communication_preferences").upsert({ email, alertes_enabled: actif, updated_at: now });
  const { data: sub } = await db.from("alert_subscriptions").select("id").eq("email", email).order("created_at", { ascending: false }).limit(1);
  const valeurs = { frequence, chambres: chambres.length ? chambres : ["assemblee", "senat"], active: actif, updated_at: now };
  if (sub?.length) await db.from("alert_subscriptions").update(valeurs).eq("id", sub[0].id);
  else await db.from("alert_subscriptions").insert({ email, ...valeurs });
  await logConsent(email, actif ? "prefs_update" : "unsubscribe", "alertes");
  redirect(`/preferences?id=${encodeURIComponent(id)}&etat=ok`);
}

export default async function Preferences({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { id, etat } = await searchParams;
  const email = await emailDepuisJeton(id);
  if (!email || etat === "invalide") {
    return (
      <div className="card">
        <h1>Lien expiré</h1>
        <p>Ce lien de préférences n&apos;est plus valable. Utilisez celui du dernier email reçu.</p>
      </div>
    );
  }
  const db = authAdmin();
  const [{ data: prefs }, { data: subs }] = await Promise.all([
    db.from("communication_preferences").select("alertes_enabled").eq("email", email).maybeSingle(),
    db.from("alert_subscriptions").select("frequence, chambres").eq("email", email).order("created_at", { ascending: false }).limit(1),
  ]);
  const sub = subs?.[0] ?? { frequence: "quotidienne", chambres: ["assemblee", "senat"] };

  return (
    <div className="card">
      <h1>Mes préférences</h1>
      <p className="meta">{email}</p>
      {etat === "ok" && <p className="ok">Préférences enregistrées.</p>}
      <form action={enregistrer}>
        <input type="hidden" name="id" value={id} />
        <label className="check"><input type="checkbox" name="alertes" defaultChecked={!!prefs?.alertes_enabled} /> Recevoir les alertes</label>
        <label htmlFor="frequence">Fréquence</label>
        <select id="frequence" name="frequence" defaultValue={sub.frequence}>
          <option value="quotidienne">Chaque jour où il y a du mouvement</option>
          <option value="hebdomadaire">Un récapitulatif par semaine</option>
        </select>
        <label>Chambres suivies</label>
        {CHAMBRES.map((c) => (
          <label key={c.v} className="check">
            <input type="checkbox" name="chambres" value={c.v} defaultChecked={(sub.chambres as string[]).includes(c.v)} /> {c.l}
          </label>
        ))}
        <button type="submit">Enregistrer</button>
      </form>
      <p className="meta" style={{ marginTop: 20 }}><a href={`/desinscription?id=${encodeURIComponent(id!)}`}>Me désinscrire de tout</a></p>
    </div>
  );
}
