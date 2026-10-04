"use client";
import { useState } from "react";
import { useAdmin } from "@/app/_components/admin/Porte";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";

type Telechargement = { id: number; cree_le: string; feuille: string; lignes: number; email: string; ip: string; user_agent: string };

export default function Telechargements() {
  const { api: _api } = useAdmin();
  const [q, setQ] = useState("");
  const [recherche, setRecherche] = useState("");
  const { data, err } = useRessource<{ total: number; telechargements: Telechargement[] }>("/api/admin/telechargements", { feuille: recherche });

  return (
    <>
      <h1>Téléchargements DataParl&apos; Sheets</h1>
      <p className="meta">Chaque export CSV du tableur, avec le compte associé et l&apos;adresse IP. 500 derniers au maximum.</p>
      <form onSubmit={(e) => { e.preventDefault(); setRecherche(q); }} className="barre-recherche">
        <input type="text" placeholder="Filtrer par feuille" value={q} onChange={(e) => setQ(e.target.value)} />
        <button>Filtrer</button>
      </form>
      {err && <p className="erreur">{err}</p>}
      {data && <>
        <p className="meta">{data.total} téléchargement(s)</p>
        <div className="defile"><table className="stats">
          <thead><tr><th>Quand</th><th>Feuille</th><th>Compte</th><th>IP</th><th>Lignes</th><th>Navigateur</th></tr></thead>
          <tbody>{data.telechargements.map((t) => (
            <tr key={t.id}>
              <td className="meta">{dateHeure(t.cree_le)}</td>
              <td><strong>{t.feuille}</strong></td>
              <td>{t.email || <span className="meta">–</span>}</td>
              <td className="mono meta">{t.ip || "–"}</td>
              <td className="meta">{t.lignes}</td>
              <td className="meta">{(t.user_agent || "–").slice(0, 60)}</td>
            </tr>))}
          </tbody>
        </table></div>
      </>}
    </>
  );
}
