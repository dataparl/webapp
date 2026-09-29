"use client";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { authBrowser } from "@/lib/supabaseBrowser";

type Compte = {
  email: string;
  cree_le: string;
  fournisseurs: string[];
  alertes: { actives: boolean; frequence: "quotidienne" | "hebdomadaire"; chambres: string[] };
};

const CHAMBRES = [
  { v: "assemblee", l: "Assemblée nationale" },
  { v: "senat", l: "Sénat" },
  { v: "europarl", l: "Parlement européen" },
];

const NOMS: Record<string, string> = { email: "Code par email", google: "Google", github: "GitHub" };

export default function MonCompte() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [compte, setCompte] = useState<Compte | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const [enCours, setEnCours] = useState(false);

  const appel = useCallback(
    (url: string, init: RequestInit = {}) =>
      fetch(url, { ...init, headers: { ...(init.headers ?? {}), Authorization: `Bearer ${session?.access_token}` } }),
    [session],
  );

  useEffect(() => {
    authBrowser().auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  useEffect(() => {
    if (!session) return;
    appel("/api/compte").then(async (r) => {
      if (r.ok) setCompte(await r.json());
      else setMessage({ ok: false, texte: "Impossible de charger ton compte." });
    });
  }, [session, appel]);

  if (session === undefined) return <p className="meta">Chargement…</p>;
  if (!session) {
    return (
      <div className="card">
        <h1>Mon compte</h1>
        <p>Connecte-toi pour gérer ton compte et tes alertes.</p>
        <a className="btn" href="/connexion?suite=/mon-compte">Se connecter</a>
      </div>
    );
  }
  if (!compte) return <p className="meta">{message?.texte ?? "Chargement…"}</p>;

  async function enregistrerAlertes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setEnCours(true);
    const r = await appel("/api/compte/alertes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actives: f.get("actives") === "on",
        frequence: f.get("frequence"),
        chambres: f.getAll("chambres"),
      }),
    });
    setEnCours(false);
    const data = await r.json().catch(() => ({}));
    setMessage(r.ok ? { ok: true, texte: "Alertes enregistrées." } : { ok: false, texte: data.error ?? "Erreur, réessaie." });
  }

  async function associer(provider: "google" | "github") {
    const { error } = await authBrowser().auth.linkIdentity({
      provider,
      options: { redirectTo: `${window.location.origin}/mon-compte` },
    });
    if (error) setMessage({ ok: false, texte: "L'association n'est pas disponible pour le moment." });
  }

  async function exporter() {
    const r = await appel("/api/compte/export");
    if (!r.ok) return setMessage({ ok: false, texte: "Export impossible, réessaie." });
    const url = URL.createObjectURL(await r.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = "dataparl-mes-donnees.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function supprimer() {
    if (!window.confirm("Supprimer définitivement ton compte, tes alertes et tes clés API ? Cette action est irréversible.")) return;
    setEnCours(true);
    const r = await appel("/api/compte", { method: "DELETE" });
    setEnCours(false);
    if (!r.ok) return setMessage({ ok: false, texte: "Suppression impossible, réessaie plus tard." });
    await authBrowser().auth.signOut();
    window.location.replace("/?compte=supprime");
  }

  async function deconnexion() {
    await authBrowser().auth.signOut();
    window.location.replace("/");
  }

  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="etroit">
      <h1>Mon <span className="surligne">compte</span></h1>
      {message && <p className={message.ok ? "ok" : "erreur"} role="status">{message.texte}</p>}

      <section className="section-compte">
        <h2>Profil et connexions</h2>
        <p><strong>{compte.email}</strong><br /><span className="meta">Compte créé le {fmt.format(new Date(compte.cree_le))}</span></p>
        <p>Méthodes de connexion : {compte.fournisseurs.map((f) => NOMS[f] ?? f).join(", ")}</p>
        {!compte.fournisseurs.includes("google") && (
          <button className="secondaire" onClick={() => associer("google")}>Associer mon compte Google</button>
        )}{" "}
        {!compte.fournisseurs.includes("github") && (
          <button className="secondaire" onClick={() => associer("github")}>Associer mon compte GitHub</button>
        )}
        <p><button className="lien" onClick={deconnexion}>Se déconnecter</button></p>
      </section>

      <section className="section-compte">
        <h2>Mes alertes</h2>
        <form onSubmit={enregistrerAlertes}>
          <label className="check"><input type="checkbox" name="actives" defaultChecked={compte.alertes.actives} /> Recevoir les alertes par email à {compte.email}</label>
          <label htmlFor="frequence">Fréquence</label>
          <select id="frequence" name="frequence" defaultValue={compte.alertes.frequence}>
            <option value="quotidienne">Chaque jour où il y a du mouvement</option>
            <option value="hebdomadaire">Un récapitulatif par semaine</option>
          </select>
          <label>Chambres suivies</label>
          {CHAMBRES.map((c) => (
            <label key={c.v} className="check">
              <input type="checkbox" name="chambres" value={c.v} defaultChecked={compte.alertes.chambres.includes(c.v)} /> {c.l}
            </label>
          ))}
          <button type="submit" disabled={enCours}>Enregistrer</button>
        </form>
      </section>

      <section className="section-compte">
        <h2>Mes données</h2>
        <p>Télécharge tout ce que DataParl&apos; conserve sur toi (format JSON), ou supprime ton compte.</p>
        <button className="secondaire" onClick={exporter}>Exporter mes données</button>{" "}
        <button className="danger" onClick={supprimer} disabled={enCours}>Supprimer mon compte</button>
        <p className="meta">
          La suppression efface ton compte, tes alertes et tes clés API. La trace de tes consentements est conservée 3 ans,
          comme prévu par la <a href="/informations-legales/confidentialite">politique de données personnelles</a>.
        </p>
      </section>

      <p className="meta" style={{ marginTop: 24 }}>Tes clés API se gèrent sur la page <a href="/api">API</a>.</p>
    </div>
  );
}
