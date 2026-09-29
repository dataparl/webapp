"use client";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { authBrowser } from "@/lib/supabaseBrowser";

type Compte = {
  email: string;
  cree_le: string;
  fournisseurs: string[];
  alertes: { actives: boolean; frequence: "quotidienne" | "hebdomadaire"; chambres: string[]; types: string[] };
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
        <p>
          {compte.alertes.actives
            ? `Actives : ${compte.alertes.chambres.map((c) => CHAMBRES.find((x) => x.v === c)?.l ?? c).join(", ")}, ${compte.alertes.frequence === "quotidienne" ? "chaque jour où ça bouge" : "une fois par semaine"}.`
            : "Tu ne reçois pas d'alertes pour l'instant."}
        </p>
        <a className="btn secondaire" href="/alertes">Régler mes alertes</a>
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

      <section className="section-compte">
        <h2>Mon espace API</h2>
        <p>Ta clé API, sa consommation et la documentation sont sur le site de l&apos;API.</p>
        <a className="btn secondaire" href="https://api.cavaparlement.eu/mon-espace-api">Ouvrir mon espace API</a>
      </section>
    </div>
  );
}
