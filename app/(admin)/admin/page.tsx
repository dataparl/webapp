"use client";
import { lien } from "@/app/_components/admin/liens";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";

type Stats = {
  comptes: number;
  abonnes: { total: number; confirmes: number; alertes_actives: number };
  envois_7j: number; consentements_7j: number; contacts_nouveaux: number; emails_non_lus: number; cles_actives: number;
  runs: { run_id: string; chambre: string; date: string; statut: string; n_affectations: number; n_arrivees: number; n_departs: number; n_transferts: number; message: string }[];
};

export default function TableauDeBord() {
  const { data: s, err } = useRessource<Stats>("/api/admin/stats");
  if (err) return <p className="erreur">{err}</p>;
  if (!s) return <p className="meta">Chargement…</p>;
  return (
    <>
      <h1>Tableau de bord</h1>
      <div className="chiffres">
        <div><strong>{s.contacts_nouveaux}</strong><span><a href={lien("admin", "/contact")}>messages de contact à traiter</a></span></div>
        <div><strong>{s.emails_non_lus}</strong><span><a href={lien("webmail")}>emails non lus</a></span></div>
        <div><strong>{s.comptes}</strong><span>comptes DataParl&apos; Auth</span></div>
        <div><strong>{s.abonnes.alertes_actives}</strong><span>alertes actives</span></div>
        <div><strong>{s.cles_actives}</strong><span>clés API actives</span></div>
      </div>
      <table className="stats">
        <tbody>
          <tr><th>Inscrits aux alertes</th><td className="num">{s.abonnes.total}</td></tr>
          <tr><th>Inscriptions confirmées</th><td className="num">{s.abonnes.confirmes}</td></tr>
          <tr><th>Emails envoyés (7 jours)</th><td className="num">{s.envois_7j}</td></tr>
          <tr><th>Actions de consentement (7 jours)</th><td className="num">{s.consentements_7j}</td></tr>
        </tbody>
      </table>
      <h2>Derniers passages du robot</h2>
      {s.runs.length === 0 ? <p className="meta">Aucune donnée (base de données indisponible ?).</p> : (
        <div className="defile"><table className="stats">
          <thead><tr><th>Date</th><th>Chambre</th><th>Statut</th><th className="num">Affectations</th><th className="num">Arrivées</th><th className="num">Départs</th><th className="num">Transferts</th><th>Message</th></tr></thead>
          <tbody>{s.runs.map((r) => (
            <tr key={r.run_id + r.chambre}>
              <td>{r.date}</td><td>{r.chambre}</td>
              <td className={r.statut === "ok" || r.statut === "initialisation" ? "ok" : "erreur"}>{r.statut}</td>
              <td className="num">{r.n_affectations}</td><td className="num">{r.n_arrivees}</td><td className="num">{r.n_departs}</td><td className="num">{r.n_transferts}</td>
              <td className="meta">{r.message}</td>
            </tr>))}
          </tbody>
        </table></div>
      )}
      <p className="meta">Mis à jour le {dateHeure(new Date().toISOString())}. Le détail des runs est dans les Actions GitHub de dataparl/collaborateurs.</p>
    </>
  );
}
