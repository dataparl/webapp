"use client";
import { useState } from "react";
import { useAdmin } from "@/app/_components/admin/Porte";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";
import { CHAMBRE } from "@/lib/format";

type Opp = { chambre: string; collab_cle: string; motif: string | null; created_at: string };

export default function Oppositions() {
  const { api } = useAdmin();
  const { data, err, recharger } = useRessource<{ oppositions: Opp[] }>("/api/admin/oppositions");
  const [f, setF] = useState({ chambre: "assemblee", prenom: "", nom: "", motif: "" });
  const [etat, setEtat] = useState<string | null>(null);

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await api<{ collab_cle: string }>("/api/admin/oppositions", { method: "POST", body: { ...f, motif: f.motif || undefined } });
      setEtat(`Email masqué pour « ${r.collab_cle} ».`);
      setF({ ...f, prenom: "", nom: "", motif: "" });
      recharger();
    } catch (e) { setEtat((e as Error).message); }
  }
  async function retirer(o: Opp) {
    if (!confirm(`Réafficher l'email de « ${o.collab_cle} » ?`)) return;
    await api("/api/admin/oppositions", { method: "DELETE", body: { chambre: o.chambre, collab_cle: o.collab_cle } });
    recharger();
  }

  return (
    <>
      <h1>Oppositions (emails masqués)</h1>
      <p className="lead">Quand un(e) collaborateur(rice) exerce son droit d&apos;opposition, son email déduit n&apos;est plus affiché sur /collabs ni exporté. La fiche reste publique (données publiées par les assemblées).</p>
      <form onSubmit={ajouter} className="card">
        <div className="grille-filtres">
          <div><label>Chambre</label>
            <select value={f.chambre} onChange={(e) => setF({ ...f, chambre: e.target.value })}>
              <option value="assemblee">Assemblée</option><option value="senat">Sénat</option><option value="europarl">Parlement européen</option>
            </select></div>
          <div><label>Prénom</label><input type="text" required value={f.prenom} onChange={(e) => setF({ ...f, prenom: e.target.value })} /></div>
          <div><label>Nom</label><input type="text" required value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} /></div>
        </div>
        <label>Motif (facultatif, interne)</label>
        <input type="text" value={f.motif} onChange={(e) => setF({ ...f, motif: e.target.value })} placeholder="ex. demande reçue par le formulaire RGPD le…" />
        <button>Masquer l&apos;email</button>
        {etat && <p className="meta">{etat}</p>}
      </form>
      {err && <p className="erreur">{err}</p>}
      {data && (data.oppositions.length === 0 ? <p className="meta">Aucune opposition enregistrée.</p> : (
        <table className="stats" style={{ marginTop: 24 }}>
          <thead><tr><th>Chambre</th><th>Clé du nom</th><th>Motif</th><th>Depuis</th><th></th></tr></thead>
          <tbody>{data.oppositions.map((o) => (
            <tr key={o.chambre + o.collab_cle}>
              <td>{CHAMBRE[o.chambre] ?? o.chambre}</td><td><code>{o.collab_cle}</code></td><td className="meta">{o.motif ?? "–"}</td>
              <td className="meta">{dateHeure(o.created_at)}</td>
              <td><button className="lien" onClick={() => retirer(o)}>Retirer</button></td>
            </tr>))}
          </tbody>
        </table>
      ))}
    </>
  );
}
