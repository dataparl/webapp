"use client";
import { useState } from "react";
import { useAdmin } from "@/app/_components/admin/Porte";
import { lien } from "@/app/_components/admin/liens";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";

type Offre = {
  id: string; titre: string; description: string;
  type_poste: string | null; localisation: string | null; groupe_politique: string | null;
  parlementaire_slug: string | null; source_url: string; source_connector: string;
  source_raw: string | null; publie_le: string | null; expire_le: string | null;
  review_status: string; review_note: string | null; match_confidence: number | null;
  created_at: string; updated_at: string;
};

// File de revue : chaque offre collectée ou soumise passe par une validation
// humaine — on publie, on corrige avant de publier, on rejette avec un motif,
// ou on supprime définitivement (offre de test, spam, doublon bancal).
export default function Revue() {
  const { data, err, recharger } = useRessource<{ offres: Offre[] }>("/api/admin/jobs?vue=revue");
  const [info, setInfo] = useState<string | null>(null);
  if (err) return <p className="erreur">{err}</p>;
  if (!data) return <p className="meta">Chargement…</p>;
  return (
    <>
      <h1>Emplois — file de revue ({data.offres.length})</h1>
      <p className="meta"><a href={lien("admin", "/emplois/offres")}>Offres publiées et archivées →</a></p>
      {info && <p className="meta">{info}</p>}
      {data.offres.length === 0 && <p className="meta">Aucune offre en attente de validation.</p>}
      {data.offres.map((o) => (
        <Carte key={o.id} offre={o} onDone={recharger} setInfo={setInfo} />
      ))}
    </>
  );
}

function Carte({ offre: o, onDone, setInfo }: { offre: Offre; onDone: () => void; setInfo: (s: string | null) => void }) {
  const { api } = useAdmin();
  const [f, setF] = useState({
    titre: o.titre,
    description: o.description,
    type_poste: o.type_poste ?? "",
    localisation: o.localisation ?? "",
    groupe_politique: o.groupe_politique ?? "",
    parlementaire_slug: o.parlementaire_slug ?? "",
    publie_le: (o.publie_le ?? "").slice(0, 10),
    expire_le: (o.expire_le ?? "").slice(0, 10),
    review_note: "",
  });
  const [occupe, setOccupe] = useState(false);
  const maj = (k: keyof typeof f) => ({
    value: f[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value }),
  });

  async function decider(decision: "valider" | "rejeter") {
    setOccupe(true); setInfo(null);
    try {
      await api("/api/admin/jobs/" + o.id, { method: "PATCH", body: { decision, ...f } });
      setInfo(decision === "valider" ? "Offre publiée : " + o.titre : "Offre rejetée : " + o.titre);
      onDone();
    } catch (e) { setInfo((e as Error).message); }
    setOccupe(false);
  }

  async function supprimer() {
    setOccupe(true); setInfo(null);
    try {
      await api("/api/admin/jobs/" + o.id, { method: "DELETE" });
      setInfo("Offre supprimée définitivement : " + o.titre);
      onDone();
    } catch (e) { setInfo((e as Error).message); }
    setOccupe(false);
  }

  return (
    <details className="carte-revue" open>
      <summary><strong>{o.titre}</strong> <span className="meta">— collectée le {dateHeure(o.created_at)} · source : {o.source_connector}</span></summary>
      <p><a href={o.source_url} target="_blank" rel="noopener noreferrer">{o.source_url}</a>{o.match_confidence != null && <span className="meta"> · confiance rattachement : {Math.round(o.match_confidence * 100)} %</span>}</p>
      {o.source_raw && <details><summary className="meta">Texte brut collecté</summary><pre>{o.source_raw}</pre></details>}
      <form onSubmit={(e) => { e.preventDefault(); decider("valider"); }}>
        <label>Titre<input {...maj("titre")} required maxLength={300} /></label>
        <label>Description<textarea {...maj("description")} rows={6} /></label>
        <label>Type de poste<input {...maj("type_poste")} maxLength={100} /></label>
        <label>Localisation<input {...maj("localisation")} maxLength={100} /></label>
        <label>Groupe politique<input {...maj("groupe_politique")} maxLength={100} /></label>
        <label>Élu / équipe (clé du répertoire)<input {...maj("parlementaire_slug")} maxLength={200} placeholder="ex : bourcier_corinne21046e" /></label>
        <label>Publiée le<input type="date" {...maj("publie_le")} /></label>
        <label>Expire le<input type="date" {...maj("expire_le")} /></label>
        <label>Note interne<input {...maj("review_note")} maxLength={2000} /></label>
        <button type="submit" disabled={occupe}>Publier</button>{" "}
        <button type="button" disabled={occupe} onClick={() => { if (f.review_note.trim() || confirm("Rejeter sans motif ?")) decider("rejeter"); }}>Rejeter</button>{" "}
        <button type="button" disabled={occupe} onClick={() => { if (confirm("Supprimer définitivement cette offre ? (irréversible — elle pourra être recollectée si elle reparaît en source)") supprimer(); }}>Supprimer</button>
      </form>
    </details>
  );
}
