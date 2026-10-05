"use client";
import { useState } from "react";
import { useAdmin } from "@/app/_components/admin/Porte";
import { lien } from "@/app/_components/admin/liens";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";

type Offre = {
  id: string; titre: string; description: string;
  type_poste: string | null; localisation: string | null; groupe_politique: string | null;
  parlementaire_slug: string | null; source_url: string; source_connector: string;
  publie_le: string | null; expire_le: string | null; statut: string;
  review_status: string; review_note: string | null; created_at: string; updated_at: string;
};

type Vue = "actives" | "archivees";

// Offres publiées, archivées, et saisie d'une nouvelle offre (qui part en revue).
export default function Gestion() {
  const [vue, setVue] = useState<Vue>("actives");
  const { data, err, recharger } = useRessource<{ offres: Offre[] }>("/api/admin/jobs?vue=" + vue);
  const [info, setInfo] = useState<string | null>(null);
  return (
    <>
      <h1>Emplois — offres</h1>
      <p className="meta"><a href={lien("admin", "/emplois")}>← File de revue</a></p>
      {info && <p className="meta">{info}</p>}
      <Nouvelle onCree={() => { setInfo("Offre enregistrée : elle attend la revue."); recharger(); }} setInfo={setInfo} />
      <nav className="onglets">
        <button onClick={() => setVue("actives")} aria-current={vue === "actives" ? "page" : undefined}>Publiées</button>{" "}
        <button onClick={() => setVue("archivees")} aria-current={vue === "archivees" ? "page" : undefined}>Archivées</button>
      </nav>
      {err && <p className="erreur">{err}</p>}
      {!data && !err && <p className="meta">Chargement…</p>}
      {data && data.offres.length === 0 && <p className="meta">Aucune offre.</p>}
      {data && data.offres.length > 0 && (
        <table className="stats">
          <thead><tr><th>Titre</th><th>Équipe</th><th>Publication</th><th>Source</th>{vue === "actives" ? <th>Actions</th> : <th>Statut</th>}</tr></thead>
          <tbody>
            {data.offres.map((o) => (
              <tr key={o.id}>
                <td><strong>{o.titre}</strong>{o.review_note && <span className="meta"> · {o.review_note}</span>}</td>
                <td className="meta">{o.groupe_politique ?? "—"}{o.parlementaire_slug ? " · " + o.parlementaire_slug : ""}</td>
                <td className="meta">{dateHeure(o.publie_le)}</td>
                <td><a href={o.source_url} target="_blank" rel="noopener noreferrer">lien</a></td>
                {vue === "actives" ? (
                  <td><Actions id={o.id} fait={(s) => { setInfo(s); recharger(); }} /></td>
                ) : (
                  <td className="meta">{o.statut} · {dateHeure(o.updated_at)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function Actions({ id, fait }: { id: string; fait: (s: string) => void }) {
  const { api } = useAdmin();
  const [occupe, setOccupe] = useState(false);
  async function statut(s: "pourvue" | "expiree") {
    setOccupe(true);
    try { await api("/api/admin/jobs/" + id, { method: "PATCH", body: { statut: s } }); fait("Offre marquée " + s + "."); }
    catch (e) { fait((e as Error).message); }
    setOccupe(false);
  }
  return (
    <>
      <button type="button" disabled={occupe} onClick={() => statut("pourvue")}>Pourvue</button>{" "}
      <button type="button" disabled={occupe} onClick={() => statut("expiree")}>Expirée</button>
    </>
  );
}

function Nouvelle({ onCree, setInfo }: { onCree: () => void; setInfo: (s: string | null) => void }) {
  const { api } = useAdmin();
  const [f, setF] = useState({ titre: "", description: "", source_url: "", type_poste: "", localisation: "", groupe_politique: "", parlementaire_slug: "", publie_le: "" });
  const maj = (k: keyof typeof f) => ({
    value: f[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value }),
  });
  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api("/api/admin/jobs", { method: "POST", body: { ...f, source_connector: "manuel" } });
      setF({ titre: "", description: "", source_url: "", type_poste: "", localisation: "", groupe_politique: "", parlementaire_slug: "", publie_le: "" });
      onCree();
    } catch (e2) { setInfo((e2 as Error).message); }
  }
  return (
    <details>
      <summary>Saisir une offre</summary>
      <form onSubmit={enregistrer}>
        <label>Intitulé du poste *<input {...maj("titre")} required maxLength={300} /></label>
        <label>URL de la source *<input type="url" {...maj("source_url")} required maxLength={1000} /></label>
        <label>Description<textarea {...maj("description")} rows={4} /></label>
        <label>Type de poste<input {...maj("type_poste")} maxLength={100} /></label>
        <label>Localisation<input {...maj("localisation")} maxLength={100} /></label>
        <label>Groupe politique<input {...maj("groupe_politique")} maxLength={100} /></label>
        <label>Élu / équipe (clé du répertoire)<input {...maj("parlementaire_slug")} maxLength={200} placeholder="ex : bourcier_corinne21046e" /></label>
        <label>Publiée le<input type="date" {...maj("publie_le")} /></label>
        <button type="submit">Mettre en file de revue</button>
      </form>
    </details>
  );
}
