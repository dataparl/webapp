"use client";
import { useState } from "react";
import { useAdmin } from "@/app/_components/admin/Porte";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";

type Feuille = { id: string; titre: string; description: string; publie: boolean; maj_le: string | null };

export default function FeuillesSheets() {
  const { api } = useAdmin();
  const { data, err, recharger } = useRessource<{ feuilles: Feuille[] }>("/api/admin/content/sheets");
  const [message, setMessage] = useState<string | null>(null);
  if (err) return <p className="erreur">{err}</p>;
  if (!data) return <p className="meta">Chargement…</p>;

  async function changer(f: Feuille, publie: boolean) {
    const texte = publie
      ? `Publier « ${f.titre} » en libre accès sur www.dataparl.fr/sheets ?`
      : `Masquer « ${f.titre} » ? La feuille répondra 404 (l'accès direct redirige vers la liste des feuilles).`;
    if (!confirm(texte)) return;
    try { await api("/api/admin/content/sheets", { method: "PATCH", body: { id: f.id, publie } }); setMessage(null); await recharger(); }
    catch (e) { setMessage((e as Error).message); }
  }

  return (
    <>
      <h1>DataParl&apos; Sheets</h1>
      <p className="meta">
        Feuilles du tableur (www.dataparl.fr/sheets). Une feuille publiée est en libre accès (connexion + vidéo
        publicitaire pour la consulter) ; une feuille masquée répond 404. Le changement est effectif en une
        minute environ.
      </p>
      {message && <p className="erreur">{message}</p>}
      <div className="defile">
        <table className="stats">
          <thead><tr><th>Feuille</th><th>Adresse</th><th>État</th><th>Modifiée</th><th></th></tr></thead>
          <tbody>{data.feuilles.map((f) => (
            <tr key={f.id}>
              <td><strong>{f.titre}</strong><span className="meta"> · {f.description}</span></td>
              <td><a className="mono" href={`https://www.dataparl.fr/sheets/${f.id}`} target="_blank" rel="noreferrer">/sheets/{f.id}</a></td>
              <td>{f.publie ? <span className="ok">Publiée</span> : <span className="meta">Masquée</span>}</td>
              <td className="meta">{dateHeure(f.maj_le)}</td>
              <td>
                <button onClick={() => changer(f, !f.publie)}>{f.publie ? "Masquer" : "Publier"}</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
