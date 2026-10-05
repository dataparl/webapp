"use client";
import { use } from "react";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";

type Reponse = {
  id: string; email: string; user_id: string | null;
  note_experience: number | null; note_contenu: number | null; note_global: number | null;
  commentaire: string | null; cree_le: string; repondu_le: string | null;
};

// Détail d'une réponse à l'enquête : qui (compte + prénom/nom), quand, les
// trois notes et le commentaire.
export default function ReponseEnquete({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, err } = useRessource<{ reponse: Reponse; qui: { prenom: string; nom: string } | null }>(
    "/api/admin/content/survey", { id },
  );
  if (err) return <p className="erreur">{err}</p>;
  if (!data) return <p className="meta">Chargement…</p>;
  const r = data.reponse;
  return (
    <>
      <p><a href="/admin/content/survey">← Toutes les réponses</a></p>
      <h1 style={{ marginTop: 0 }}>Réponse à l&apos;enquête</h1>
      <div className="carte-admin">
        <header><strong>{data.qui?.prenom ? `${data.qui.prenom} ${data.qui.nom}`.trim() : "Compte"}</strong> <span className="meta">{r.email}</span></header>
        <p className="meta" style={{ marginTop: 8, marginBottom: 0 }}>
          Invitation ouverte le {dateHeure(r.cree_le)} · {r.repondu_le ? `réponse le ${dateHeure(r.repondu_le)}` : "pas encore répondue"}
        </p>
      </div>
      <div className="chiffres">
        <div><strong>{r.note_experience ?? "–"}</strong><span>expérience /5</span></div>
        <div><strong>{r.note_contenu ?? "–"}</strong><span>contenu de fond /5</span></div>
        <div><strong>{r.note_global ?? "–"}</strong><span>note globale /5</span></div>
      </div>
      {r.commentaire && (
        <>
          <h2>Commentaire</h2>
          <blockquote className="citation">{r.commentaire}</blockquote>
        </>
      )}
    </>
  );
}
