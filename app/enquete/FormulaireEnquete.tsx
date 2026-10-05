"use client";
import { useState } from "react";

// Formulaire du questionnaire : 3 notes (expérience, contenu, global) et un
// commentaire libre. Envoi par jeton (POST /api/enquete/repondre), réponse
// unique.

const ETOILES = [1, 2, 3, 4, 5];

function Note({ choix, set }: { choix: number | null; set: (n: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, margin: "6px 0 2px" }}>
      {ETOILES.map((n) => (
        <button
          key={n} type="button" aria-label={`${n} sur 5`}
          onClick={() => set(n)}
          style={{
            all: "unset", cursor: "pointer", boxSizing: "border-box", width: 44, height: 44, textAlign: "center",
            fontSize: "1.4rem", borderRadius: 10, border: `1px solid ${choix === n ? "#164DFF" : "#E6E3D8"}`,
            background: choix && n <= choix ? "#FFF7D6" : "transparent",
          }}
        >★</button>
      ))}
    </div>
  );
}

export default function FormulaireEnquete({ jeton }: { jeton: string }) {
  const [experience, setExperience] = useState<number | null>(null);
  const [contenu, setContenu] = useState<number | null>(null);
  const [global, setGlobal] = useState<number | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [etat, setEtat] = useState<"attente" | "envoi" | "merci" | "erreur">("attente");
  const [message, setMessage] = useState("");

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (etat === "envoi") return;
    if (experience === null || contenu === null || global === null) {
      setMessage("Choisis une note pour chaque ligne.");
      setEtat("erreur");
      return;
    }
    setEtat("envoi");
    const r = await fetch("/api/enquete/repondre", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ j: jeton, note_experience: experience, note_contenu: contenu, note_global: global, commentaire }),
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setMessage(d.error === "déjà répondu" ? "Ce questionnaire a déjà été rempli." : "Envoi impossible, réessaie dans un instant.");
      setEtat("erreur");
      return;
    }
    setEtat("merci");
  }

  if (etat === "merci") {
    return (
      <>
        <h1>Merci, c&apos;est <span className="surligne">noté</span> !</h1>
        <p className="lead">Ta réponse est enregistrée, elle rejoint directement l&apos;équipe.</p>
        <p><a className="btn" href="https://www.dataparl.fr/">Retour sur DataParl&apos;</a></p>
      </>
    );
  }

  return (
    <form onSubmit={envoyer}>
      <h1 style={{ fontSize: "1.7rem" }}>30 secondes pour <span className="surligne">tout changer</span></h1>
      <p className="lead">3 notes, un commentaire si tu veux. Tes réponses sont confidentielles et liées à ton compte uniquement pour éviter les doublons.</p>

      <label style={{ marginTop: 22 }}>Ton expérience du site (navigation, vitesse, clarté)</label>
      <Note choix={experience} set={setExperience} />

      <label>Le contenu de fond (données, méthodes, explications)</label>
      <Note choix={contenu} set={setContenu} />

      <label>Ta note globale pour DataParl&apos;</label>
      <Note choix={global} set={setGlobal} />

      <label htmlFor="commentaire">Un commentaire ? (facultatif)</label>
      <textarea
        id="commentaire" value={commentaire} maxLength={2000}
        onChange={(e) => setCommentaire(e.target.value)}
        style={{ width: "100%", minHeight: 90, padding: "10px 12px", border: "1px solid #E6E3D8", borderRadius: 10, font: "inherit" }}
        placeholder="Ce qui te manque, ce que tu changerais, ce que tu voudrais voir ensuite…"
      />
      {etat === "erreur" && <p className="erreur" style={{ color: "#C8102E" }}>{message}</p>}
      <p><button className="btn" type="submit" disabled={etat === "envoi"}>{etat === "envoi" ? "Envoi…" : "Envoyer mes réponses"}</button></p>
    </form>
  );
}
