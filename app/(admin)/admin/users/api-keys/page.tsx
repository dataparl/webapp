"use client";
import { useAdmin } from "@/app/_components/admin/Porte";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";

type Cle = { id: string; nom: string; prefixe: string; email: string | null; quota_jour: number; created_at: string; last_used_at: string | null; revoked_at: string | null; requetes_30j: number; requetes_jour: number };

export default function Cles() {
  const { api } = useAdmin();
  const { data, err, recharger } = useRessource<{ cles: Cle[] }>("/api/admin/cles");

  async function quota(c: Cle) {
    const v = prompt(`Quota journalier pour ${c.prefixe}…`, String(c.quota_jour));
    if (v === null) return;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0) return alert("Nombre entier attendu.");
    await api("/api/admin/cles", { method: "PATCH", body: { id: c.id, quota_jour: n } });
    recharger();
  }
  async function revoquer(c: Cle) {
    if (!confirm(`Révoquer la clé ${c.prefixe}… de ${c.email ?? "?"} ? Les appels échoueront immédiatement.`)) return;
    await api("/api/admin/cles", { method: "PATCH", body: { id: c.id, revoquer: true } });
    recharger();
  }

  return (
    <>
      <h1>Clés API</h1>
      {err && <p className="erreur">{err}</p>}
      {data && (data.cles.length === 0 ? <p className="meta">Aucune clé.</p> : (
        <div className="defile"><table className="stats">
          <thead><tr><th>Clé</th><th>Compte</th><th className="num">Aujourd&apos;hui</th><th className="num">30 jours</th><th className="num">Quota/jour</th><th>Dernier appel</th><th>État</th><th></th></tr></thead>
          <tbody>{data.cles.map((c) => (
            <tr key={c.id}>
              <td><code>{c.prefixe}…</code><br /><span className="meta">{c.nom}</span></td>
              <td>{c.email ?? "–"}</td>
              <td className="num">{c.requetes_jour}</td><td className="num">{c.requetes_30j}</td>
              <td className="num"><button className="lien" onClick={() => quota(c)} disabled={!!c.revoked_at}>{c.quota_jour}</button></td>
              <td className="meta">{dateHeure(c.last_used_at)}</td>
              <td>{c.revoked_at ? <span className="erreur">révoquée</span> : <span className="ok">active</span>}</td>
              <td>{!c.revoked_at && <button className="lien" onClick={() => revoquer(c)}>Révoquer</button>}</td>
            </tr>))}
          </tbody>
        </table></div>
      ))}
    </>
  );
}
