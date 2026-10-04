"use client";
import { useState } from "react";
import { useAdmin } from "@/app/_components/admin/Porte";
import { useRessource } from "@/app/_components/admin/utils";
import Onglets from "../Onglets";

type Contact = { id: string; prenom: string; nom: string; media: string; email: string; notes: string; actif: boolean; desinscrit_le: string | null };
const VIDE = { prenom: "", nom: "", media: "", email: "", notes: "" };

export default function CarnetPresse() {
  const { api } = useAdmin();
  const { data, err, recharger } = useRessource<{ contacts: Contact[] }>("/api/admin/communication/presse");
  const [f, setF] = useState(VIDE);
  const [lot, setLot] = useState("");
  const [q, setQ] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; t: string } | null>(null);

  async function ajouter(body: unknown) {
    try {
      const r = await api<{ ajoutes: number; deja: number; ignorees: number }>("/api/admin/communication/presse", { method: "POST", body });
      setMessage({ ok: true, t: `${r.ajoutes} contact(s) ajouté(s)${r.deja ? `, ${r.deja} déjà présent(s)` : ""}${r.ignorees ? `, ${r.ignorees} ligne(s) ignorée(s)` : ""}.` });
      setF(VIDE); setLot("");
      await recharger();
    } catch (e) { setMessage({ ok: false, t: (e as Error).message }); }
  }
  async function basculer(c: Contact) { await api("/api/admin/communication/presse", { method: "PATCH", body: { id: c.id, actif: !c.actif } }); recharger(); }
  async function supprimer(c: Contact) {
    if (!confirm(`Supprimer ${c.email} du carnet ?`)) return;
    await api(`/api/admin/communication/presse?id=${c.id}`, { method: "DELETE" }); recharger();
  }
  const n = (s: string) => s.toLowerCase();
  const visibles = (data?.contacts ?? []).filter((c) => !q || n(`${c.prenom} ${c.nom} ${c.media} ${c.email}`).includes(n(q)));

  return (
    <>
      <h1>Carnet presse</h1>
      <Onglets />
      <div className="deux-colonnes">
        <form className="card" onSubmit={(e) => { e.preventDefault(); ajouter(f); }}>
          <h2 style={{ marginTop: 0 }}>Ajouter un journaliste</h2>
          <div className="grille-2">
            <div><label htmlFor="c-p">Prénom</label><input id="c-p" type="text" value={f.prenom} onChange={(e) => setF({ ...f, prenom: e.target.value })} /></div>
            <div><label htmlFor="c-n">Nom</label><input id="c-n" type="text" value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} /></div>
          </div>
          <label htmlFor="c-m">Média</label><input id="c-m" type="text" value={f.media} onChange={(e) => setF({ ...f, media: e.target.value })} />
          <label htmlFor="c-e">Email</label><input id="c-e" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <label htmlFor="c-no">Notes</label><input id="c-no" type="text" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Rubrique, sujet suivi…" />
          <button>Ajouter</button>
        </form>
        <form className="card" onSubmit={(e) => { e.preventDefault(); ajouter({ lot }); }}>
          <h2 style={{ marginTop: 0 }}>Coller une liste</h2>
          <p className="meta">Une ligne par personne : <span className="mono">prénom;nom;média;email</span> (copier-coller depuis un tableur accepté).</p>
          <textarea rows={8} value={lot} onChange={(e) => setLot(e.target.value)} placeholder={"Marie;Dupont;Le Quotidien;marie.dupont@exemple.fr"} />
          <button disabled={!lot.trim()}>Importer</button>
        </form>
      </div>
      {message && <p className={message.ok ? "ok" : "erreur"}>{message.t}</p>}
      {err && <p className="erreur">{err}</p>}
      {data && <>
        <div className="barre-recherche" style={{ marginTop: 24 }}><input type="text" placeholder="Filtrer par nom, média ou email" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <p className="meta">{data.contacts.filter((c) => c.actif).length} contact(s) actif(s) sur {data.contacts.length}</p>
        <div className="defile"><table className="stats">
          <thead><tr><th>Nom</th><th>Média</th><th>Email</th><th>Notes</th><th>État</th><th></th></tr></thead>
          <tbody>
            {visibles.map((c) => (
              <tr key={c.id}>
                <td><strong>{[c.prenom, c.nom].filter(Boolean).join(" ") || "–"}</strong></td><td>{c.media || "–"}</td><td>{c.email}</td><td className="meta">{c.notes}</td>
                <td>{c.desinscrit_le ? <span className="meta">désinscrit</span> : c.actif ? <span className="ok">actif</span> : <span className="meta">en pause</span>}</td>
                <td className="actions" style={{ flexWrap: "nowrap" }}>
                  {!c.desinscrit_le && <><button className="lien" onClick={() => basculer(c)}>{c.actif ? "Mettre en pause" : "Réactiver"}</button> · </>}
                  <button className="lien" onClick={() => supprimer(c)}>Supprimer</button>
                </td>
              </tr>
            ))}
            {visibles.length === 0 && <tr><td colSpan={6} className="meta">Aucun contact.</td></tr>}
          </tbody>
        </table></div>
      </>}
    </>
  );
}
