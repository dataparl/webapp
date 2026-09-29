"use client";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";

type Ligne = { id: number; github_login: string | null; action: string; cible: string | null; details: Record<string, unknown>; created_at: string };

export default function Journal() {
  const { data, err } = useRessource<{ journal: Ligne[] }>("/api/admin/journal");
  return (
    <>
      <h1>Journal des actions</h1>
      <p className="lead">Les 200 dernières actions d&apos;administration : connexions au second facteur, envois de la webmail, modifications.</p>
      {err && <p className="erreur">{err}</p>}
      {data && <div className="defile"><table className="stats">
        <thead><tr><th>Date</th><th>Admin</th><th>Action</th><th>Cible</th><th>Détails</th></tr></thead>
        <tbody>{data.journal.map((l) => (
          <tr key={l.id}>
            <td className="meta">{dateHeure(l.created_at)}</td><td>{l.github_login ?? "–"}</td>
            <td className={l.action.endsWith("echec") ? "erreur" : undefined}><code>{l.action}</code></td>
            <td className="meta">{l.cible ?? ""}</td>
            <td className="meta">{Object.keys(l.details ?? {}).length ? JSON.stringify(l.details) : ""}</td>
          </tr>))}
        </tbody>
      </table></div>}
    </>
  );
}
