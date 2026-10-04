"use client";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { CHAMBRE_LONG } from "@/lib/format";
import { dureeMois, libellePeriode } from "@/lib/periodes";
import { sessionActuelle } from "@/lib/supabaseBrowser";
import VideoDeblocage from "@/app/_components/VideoDeblocage";

type Ligne = {
  collab_id: string; chambre: string; debut: string; debut_connu: boolean; fin: string; fin_connue: boolean; en_cours: boolean;
  fonction: string; groupe: string; collab: { nom: string; slug: string; genre: string };
};

export default function HistoriqueEquipe({ personne, suite, multi }: { personne: string; suite: string; multi: boolean }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [lignes, setLignes] = useState<Ligne[] | null>(null);
  const [erreur, setErreur] = useState(false);
  const [pub, setPub] = useState(false);
  const [essai, setEssai] = useState(0);
  const [filtre, setFiltre] = useState({ chambre: "", etat: "", q: "" });

  useEffect(() => { sessionActuelle().then(setSession); }, []);
  useEffect(() => {
    if (!session) return;
    fetch(`/api/parcours/elu?personne=${encodeURIComponent(personne)}`, { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" })
      .then((r) => {
        if (r.status === 402) { setPub(true); return null; }
        return r.ok ? r.json() : Promise.reject();
      })
      .then((d) => { if (d) { setPub(false); setLignes(d.lignes); } })
      .catch(() => setErreur(true));
  }, [session, personne, essai]);

  const visibles = useMemo(() => {
    const q = filtre.q.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
    return (lignes ?? [])
      .filter((l) => !filtre.chambre || l.chambre === filtre.chambre)
      .filter((l) => !filtre.etat || (filtre.etat === "en_poste" ? l.en_cours : !l.en_cours))
      .filter((l) => !q || l.collab.nom.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().includes(q))
      .sort((a, b) => Number(b.en_cours) - Number(a.en_cours) || (b.debut || "").localeCompare(a.debut || ""));
  }, [lignes, filtre]);

  if (session === undefined) return <p className="meta">Chargement…</p>;
  if (!session) {
    return (
      <div className="card" style={{ maxWidth: "none" }}>
        <p style={{ marginTop: 0 }}><strong>L&apos;historique complet est réservé aux comptes DataParl&apos;</strong>, gratuits.</p>
        <a className="btn" href={`/connexion?suite=${encodeURIComponent(suite)}`}>Créer un compte ou se connecter</a>
      </div>
    );
  }
  if (erreur) return <p className="erreur">L&apos;historique n&apos;a pas pu être chargé. Réessaie dans un instant.</p>;
  if (pub) return <VideoDeblocage session={session} cible={`equipe:${personne}`} objet="La liste complète des collaborateurs" onDebloque={() => setEssai((n) => n + 1)} />;
  if (!lignes) return <p className="meta">Chargement de l&apos;historique…</p>;
  if (!lignes.length) return <p className="meta">Aucun collaborateur connu dans les archives.</p>;

  const personnes = new Set(lignes.map((l) => l.collab_id)).size;
  const enPoste = new Set(lignes.filter((l) => l.en_cours).map((l) => l.collab_id)).size;
  const durees = lignes.map((l) => (l.debut_connu && l.fin_connue ? dureeMois(l.debut, l.fin) : null)).filter((d): d is number => d !== null);
  const moyenne = durees.length ? Math.round(durees.reduce((a, b) => a + b, 0) / durees.length) : null;

  return (
    <>
      <div className="chiffres">
        <div><strong>{personnes}</strong><span>collaborateurs au total</span></div>
        <div><strong>{enPoste}</strong><span>en poste aujourd&apos;hui</span></div>
        {moyenne !== null && <div><strong>{moyenne} mois</strong><span>durée moyenne d&apos;un poste (périodes datées)</span></div>}
      </div>
      <div className="grille-filtres">
        {multi && (
          <div>
            <label htmlFor="h-chambre">Chambre</label>
            <select id="h-chambre" value={filtre.chambre} onChange={(e) => setFiltre({ ...filtre, chambre: e.target.value })}>
              <option value="">Toutes</option>
              {[...new Set(lignes.map((l) => l.chambre))].map((c) => <option key={c} value={c}>{CHAMBRE_LONG[c]}</option>)}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="h-etat">Situation</label>
          <select id="h-etat" value={filtre.etat} onChange={(e) => setFiltre({ ...filtre, etat: e.target.value })}>
            <option value="">Tous</option><option value="en_poste">En poste</option><option value="anciens">Anciens</option>
          </select>
        </div>
        <div>
          <label htmlFor="h-q">Nom</label>
          <input id="h-q" type="text" value={filtre.q} onChange={(e) => setFiltre({ ...filtre, q: e.target.value })} placeholder="ex. Martin" />
        </div>
      </div>
      <div className="defile" style={{ marginTop: 16 }}>
        <table className="stats">
          <thead><tr><th>Collaborateur</th><th>Période</th>{multi && <th>Chambre</th>}<th>Fonction</th></tr></thead>
          <tbody>
            {visibles.map((l, i) => (
              <tr key={`${l.collab_id}-${l.chambre}-${l.debut}-${i}`}>
                <td>{l.collab.slug ? <a href={`/collab/${l.collab.slug}`}>{l.collab.nom}</a> : l.collab.nom}{l.en_cours && <span className="puce">en poste</span>}</td>
                <td>{libellePeriode(l)}</td>
                {multi && <td>{CHAMBRE_LONG[l.chambre]}</td>}
                <td className="meta">{l.fonction || "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="meta">
        « avant » : la personne figurait déjà sur la première liste disponible. Les homonymes ne sont pas distingués.
      </p>
    </>
  );
}
