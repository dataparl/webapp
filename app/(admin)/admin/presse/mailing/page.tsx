"use client";
import { useState } from "react";
import { lien } from "@/app/_components/admin/liens";
import { useAdmin } from "@/app/_components/admin/Porte";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";
import Onglets from "../Onglets";

type Etat = { audiences: { abonnes: number; comptes: number }; comptes_permis: boolean; max: number; envois: { id: string; objet: string; audience: string; cree_le: string; n_destinataires: number; n_echecs: number; ouvertures: number }[] };
const AUDIENCES = {
  abonnes: { titre: "Abonnés aux alertes", detail: "Personnes qui ont accepté de recevoir nos emails. Lien de désinscription dans chaque message." },
  comptes: { titre: "Tous les comptes", detail: "Administrateurs seulement. Message de service : évolution du service ou des conditions, incident. Pas de contenu promotionnel." },
} as const;

export default function Mailing() {
  const { api } = useAdmin();
  const { data, err, recharger } = useRessource<Etat>("/api/admin/communication/mailing");
  const [f, setF] = useState({ objet: "", texte: "", audience: "abonnes" as keyof typeof AUDIENCES });
  const [apercu, setApercu] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; t: string } | null>(null);
  const [occupe, setOccupe] = useState(false);
  const pret = f.objet.trim().length >= 3 && f.texte.trim().length >= 10;
  const effectif = data?.audiences[f.audience] ?? 0;

  async function faire(action: "apercu" | "test" | "envoyer") {
    if (action === "envoyer" && !confirm(`Envoyer « ${f.objet} » à ${effectif} destinataire(s) ? Cet envoi ne s'annule pas.`)) return;
    setOccupe(true); setMessage(null);
    try {
      const r = await api<{ html?: string; a?: string; envoyes?: number; echecs?: number; restants?: number }>("/api/admin/communication/mailing", { method: "POST", body: { action, ...f } });
      if (action === "apercu") setApercu(r.html ?? null);
      else if (action === "test") setMessage({ ok: true, t: `Test envoyé à ${r.a}.` });
      else { setMessage({ ok: true, t: `Envoyé à ${r.envoyes} destinataire(s)${r.echecs ? `, ${r.echecs} échec(s)` : ""}.${r.restants ? ` Il en reste ${r.restants} : clique à nouveau sur Envoyer pour le lot suivant.` : ""}` }); await recharger(); }
    } catch (e) { setMessage({ ok: false, t: (e as Error).message }); }
    setOccupe(false);
  }

  return (
    <>
      <h1>Mailing</h1>
      <Onglets />
      <p className="meta">Un email aux utilisateurs, en plus des alertes. La liste des comptes est sur <a href={lien("admin", "/users")}>Comptes</a>.</p>
      {err && <p className="erreur">{err}</p>}
      <div className="deux-colonnes">
        <div className="card">
          <label>Destinataires</label>
          <div className="cartes-roles">
            {(Object.keys(AUDIENCES) as (keyof typeof AUDIENCES)[]).map((a) => (
              <button key={a} type="button" className="carte-role" aria-pressed={f.audience === a} disabled={a === "comptes" && data ? !data.comptes_permis : false} onClick={() => setF({ ...f, audience: a })}>
                <strong>{AUDIENCES[a].titre} {data && `(${data.audiences[a]})`}</strong>{AUDIENCES[a].detail}
              </button>
            ))}
          </div>
          <label htmlFor="m-o">Objet</label>
          <input id="m-o" type="text" value={f.objet} onChange={(e) => setF({ ...f, objet: e.target.value })} maxLength={160} />
          <label htmlFor="m-t">Message <span className="meta">(une ligne vide entre les paragraphes)</span></label>
          <textarea id="m-t" rows={14} value={f.texte} onChange={(e) => setF({ ...f, texte: e.target.value })} />
          {message && <p className={message.ok ? "ok" : "erreur"}>{message.t}</p>}
          <div className="actions">
            <button className="secondaire" disabled={!pret || occupe} onClick={() => faire("apercu")}>Aperçu</button>
            <button className="secondaire" disabled={!pret || occupe} onClick={() => faire("test")}>M&apos;envoyer un test</button>
            <button disabled={!pret || occupe || effectif === 0} onClick={() => faire("envoyer")}>{occupe ? "Envoi…" : `Envoyer à ${effectif} destinataire(s)`}</button>
          </div>
          {data && effectif > data.max && <p className="meta">Plus de {data.max} destinataires : l&apos;envoi part par lots de {data.max}, sans doublon. Clique sur Envoyer jusqu&apos;à épuisement.</p>}
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Aperçu</h2>
          {apercu ? <iframe title="Aperçu du mailing" srcDoc={apercu} sandbox="" style={{ width: "100%", height: 560, border: "1px solid var(--line)", borderRadius: 8, background: "#F6F4EC" }} /> : <p className="meta">L&apos;aperçu s&apos;affiche ici.</p>}
        </div>
      </div>
      {data && data.envois.length > 0 && (
        <>
          <h2>Envois passés</h2>
          <div className="defile"><table className="stats">
            <thead><tr><th>Date</th><th>Objet</th><th>Audience</th><th className="num">Destinataires</th><th className="num">Ouvertures</th><th className="num">Échecs</th></tr></thead>
            <tbody>{data.envois.map((e) => <tr key={e.id}><td>{dateHeure(e.cree_le)}</td><td>{e.objet}</td><td>{e.audience}</td><td className="num">{e.n_destinataires}</td><td className="num">{e.ouvertures}</td><td className="num">{e.n_echecs}</td></tr>)}</tbody>
          </table></div>
        </>
      )}
    </>
  );
}
