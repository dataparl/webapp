"use client";
import { useState } from "react";
import { useAdmin } from "@/app/_components/admin/Porte";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";
import { SUJETS } from "@/lib/contact";

type Msg = { id: string; prenom: string; nom: string; email: string; sujet: string; message: string; statut: string; created_at: string; repondu_at: string | null; note_admin: string | null };
const STATUTS: [string, string][] = [["nouveau", "Nouveau"], ["en_cours", "En cours"], ["traite", "Traité"], ["spam", "Spam"]];
const libelleSujet = (v: string) => SUJETS.find((s) => s.v === v)?.l ?? v;

export default function Contact() {
  const [filtre, setFiltre] = useState("nouveau");
  const { data, err, recharger } = useRessource<{ messages: Msg[] }>("/api/admin/contact", { statut: filtre || undefined });
  return (
    <>
      <h1>Messages de contact</h1>
      <div className="onglets-pages">
        {[...STATUTS, ["", "Tous"] as [string, string]].map(([v, l]) => (
          <a key={v} href="#" aria-current={filtre === v ? "page" : undefined} onClick={(e) => { e.preventDefault(); setFiltre(v); }}>{l}</a>
        ))}
      </div>
      {err && <p className="erreur">{err}</p>}
      {data?.messages.length === 0 && <p className="meta">Aucun message.</p>}
      {data?.messages.map((m) => <Message key={m.id} m={m} onMaj={recharger} />)}
    </>
  );
}

function Message({ m, onMaj }: { m: Msg; onMaj: () => void }) {
  const { api } = useAdmin();
  const [ouvert, setOuvert] = useState(false);
  const [texte, setTexte] = useState(`Bonjour ${m.prenom},\n\n\n\nL'équipe DataParl'`);
  const [note, setNote] = useState(m.note_admin ?? "");
  const [etat, setEtat] = useState<string | null>(null);

  async function statut(s: string) { await api("/api/admin/contact", { method: "PATCH", body: { id: m.id, statut: s } }); onMaj(); }
  async function enregistrerNote() { await api("/api/admin/contact", { method: "PATCH", body: { id: m.id, note_admin: note } }); setEtat("Note enregistrée."); }
  async function repondre() {
    setEtat("Envoi…");
    try { await api("/api/admin/contact", { method: "POST", body: { id: m.id, texte } }); setEtat("Réponse envoyée."); onMaj(); }
    catch (e) { setEtat((e as Error).message); }
  }

  return (
    <article className="carte-admin">
      <header>
        <strong>{m.prenom} {m.nom}</strong> <span className="meta">&lt;{m.email}&gt;</span>
        <span className="puce">{libelleSujet(m.sujet)}</span>
        <span className="meta">{dateHeure(m.created_at)}{m.repondu_at ? ` · répondu le ${dateHeure(m.repondu_at)}` : ""}</span>
      </header>
      <p className="corps-message">{m.message}</p>
      <div className="actions">
        <select value={m.statut} onChange={(e) => statut(e.target.value)} aria-label="Statut">
          {STATUTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button className="secondaire" onClick={() => setOuvert(!ouvert)}>{ouvert ? "Fermer" : "Répondre"}</button>
      </div>
      {ouvert && <div>
        <label>Réponse (envoyée depuis hello@dataparl.fr, message d&apos;origine cité)</label>
        <textarea value={texte} onChange={(e) => setTexte(e.target.value)} rows={8} />
        <button onClick={repondre}>Envoyer la réponse</button>
        <label>Note interne</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} style={{ minHeight: 60 }} />
        <button className="secondaire" onClick={enregistrerNote}>Enregistrer la note</button>
      </div>}
      {etat && <p className="meta">{etat}</p>}
    </article>
  );
}
