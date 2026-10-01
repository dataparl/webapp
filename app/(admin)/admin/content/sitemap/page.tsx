"use client";
import { useState } from "react";
import { useAdmin } from "@/app/_components/admin/Porte";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";
import { estInactif, profondeur } from "@/lib/pagesRegistre";

type Page = { chemin: string; titre: string; verrou?: string; dynamique?: string; statut: "active" | "desactivee" | "brouillon"; maj_le: string | null };
const LIBELLE = { active: "Active", desactivee: "Désactivée", brouillon: "Brouillon" };

export default function PlanDuSite() {
  const { api } = useAdmin();
  const { data, err, recharger } = useRessource<{ pages: Page[] }>("/api/admin/content/sitemap");
  const [message, setMessage] = useState<string | null>(null);
  if (err) return <p className="erreur">{err}</p>;
  if (!data) return <p className="meta">Chargement…</p>;
  const inactifs = data.pages.filter((p) => p.statut !== "active").map((p) => p.chemin);

  async function changer(p: Page, statut: Page["statut"]) {
    if (statut !== "active" && !confirm(`Passer ${p.chemin} en « ${LIBELLE[statut]} » ? La page et ses sous-pages répondront 404 et sortiront du sitemap.`)) return;
    try { await api("/api/admin/content/sitemap", { method: "PATCH", body: { chemin: p.chemin, statut } }); setMessage(null); await recharger(); }
    catch (e) { setMessage((e as Error).message); }
  }

  return (
    <>
      <h1>Plan du site</h1>
      <p className="meta">Toutes les pages publiques de dataparl.fr. Une page désactivée ou en brouillon répond 404 (avec ses sous-pages) et sort du sitemap ; le changement est effectif en une minute environ.</p>
      {message && <p className="erreur">{message}</p>}
      <div className="defile">
        <table className="stats">
          <thead><tr><th>Page</th><th>Adresse</th><th>État</th><th>Modifiée</th><th></th></tr></thead>
          <tbody>{data.pages.map((p) => {
            const herite = p.statut === "active" && estInactif(p.chemin, inactifs);
            return (
              <tr key={p.chemin}>
                <td style={{ paddingLeft: 8 + profondeur(p.chemin) * 18 }}><strong>{p.titre}</strong>{p.dynamique && <span className="meta"> · {p.dynamique}</span>}</td>
                <td><a href={`https://www.dataparl.fr${p.chemin}`} target="_blank" rel="noreferrer" className="mono">{p.chemin}</a></td>
                <td>{herite ? <span className="meta">Inactive (page parente)</span> : <span className={p.statut === "active" ? "ok" : "meta"}>{LIBELLE[p.statut]}</span>}</td>
                <td className="meta">{dateHeure(p.maj_le)}</td>
                <td>{p.verrou ? <span className="meta">{p.verrou}</span> : (
                  <select aria-label={`État de ${p.chemin}`} value={p.statut} onChange={(e) => changer(p, e.target.value as Page["statut"])}>
                    <option value="active">Active</option><option value="brouillon">Brouillon</option><option value="desactivee">Désactivée</option>
                  </select>
                )}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </>
  );
}
