"use client";
import { useEffect, useState } from "react";
import { authBrowser } from "@/lib/supabaseBrowser";

type Stats = {
  github: string;
  abonnes: { total: number; confirmes: number; alertes_actives: number };
  envois_7j: number;
  consentements_7j: number;
};

export default function Admin() {
  const [etat, setEtat] = useState<"chargement" | "anonyme" | "refuse" | "ok" | "erreur">("chargement");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await authBrowser().auth.getSession();
      if (!data.session) return setEtat("anonyme");
      const r = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${data.session.access_token}` } });
      if (r.status === 401) return setEtat("anonyme");
      if (r.status === 403) return setEtat("refuse");
      if (!r.ok) return setEtat("erreur");
      setStats(await r.json());
      setEtat("ok");
    })();
  }, []);

  if (etat === "chargement") return <p className="meta">Chargement…</p>;
  if (etat === "anonyme") return <div className="card"><h1>Administration</h1><p>Connexion requise.</p><a className="btn" href="/connexion?suite=/">Se connecter</a></div>;
  if (etat === "refuse") return <div className="card"><h1>Accès refusé</h1><p>Ce compte n&apos;est pas administrateur (connexion GitHub requise).</p></div>;
  if (etat === "erreur" || !stats) return <p className="erreur">Erreur de chargement.</p>;

  return (
    <>
      <h1>Administration</h1>
      <p className="meta">Connecté via GitHub : {stats.github}</p>
      <table className="stats">
        <tbody>
          <tr><th>Inscrits</th><td>{stats.abonnes.total}</td></tr>
          <tr><th>Inscriptions confirmées</th><td>{stats.abonnes.confirmes}</td></tr>
          <tr><th>Alertes actives</th><td>{stats.abonnes.alertes_actives}</td></tr>
          <tr><th>Emails envoyés (7 jours)</th><td>{stats.envois_7j}</td></tr>
          <tr><th>Actions de consentement (7 jours)</th><td>{stats.consentements_7j}</td></tr>
        </tbody>
      </table>
      <p className="meta" style={{ marginTop: 24 }}>Webmail, campagnes et sondages arrivent en phase 2, derrière un second facteur (TOTP).</p>
    </>
  );
}
