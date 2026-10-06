"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CHAMBRES, slugOffre, titreStandard } from "@/lib/jobs";

export type OffreListe = {
  id: string;
  titre: string;
  description: string;
  chambre: string | null;
  departement: string | null;
  elu_prenom: string | null;
  elu_nom: string | null;
  groupe_politique: string | null;
  type_poste: string | null;
  localisation: string | null;
  publie_le: string | null;
  expire_le: string | null;
  source_connector: string;
};

const uniques = (xs: (string | null | undefined)[]) =>
  [...new Set(xs.filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b, "fr"));

const dateFr = (iso: string | null) =>
  iso ? new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null;

const styleSelect: React.CSSProperties = {
  padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db",
  background: "#fff", fontSize: "0.9rem", minWidth: 140,
};

// Liste publique des offres avec filtres : chambre, élu, groupe, département + recherche libre.
export default function ListeOffres({ offres }: { offres: OffreListe[] }) {
  const [chambre, setChambre] = useState("");
  const [elu, setElu] = useState("");
  const [groupe, setGroupe] = useState("");
  const [departement, setDepartement] = useState("");
  const [q, setQ] = useState("");

  const elus = useMemo(
    () => uniques(offres.map((o) => [o.elu_prenom, o.elu_nom].filter(Boolean).join(" "))),
    [offres]
  );
  const groupes = useMemo(() => uniques(offres.map((o) => o.groupe_politique)), [offres]);
  const departements = useMemo(() => uniques(offres.map((o) => o.departement)), [offres]);

  const nomElu = (o: OffreListe) => [o.elu_prenom, o.elu_nom].filter(Boolean).join(" ");

  const visibles = offres.filter((o) => {
    if (chambre && (o.chambre ?? "") !== chambre) return false;
    if (elu && nomElu(o) !== elu) return false;
    if (groupe && (o.groupe_politique ?? "") !== groupe) return false;
    if (departement && (o.departement ?? "") !== departement) return false;
    if (q) {
      const t = (titreStandard(o) + " " + o.description).toLowerCase();
      if (!t.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const reset = () => { setChambre(""); setElu(""); setGroupe(""); setDepartement(""); setQ(""); };

  return (
    <>
      {/* ——— Filtres ——— */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "24px 0 8px", alignItems: "center" }}>
        <select style={styleSelect} value={chambre} onChange={(e) => setChambre(e.target.value)} aria-label="Chambre">
          <option value="">Toutes les chambres</option>
          {CHAMBRES.map((c) => <option key={c.valeur} value={c.valeur}>{c.libelle}</option>)}
        </select>
        <select style={styleSelect} value={elu} onChange={(e) => setElu(e.target.value)} aria-label="Élu">
          <option value="">Tous les élus</option>
          {elus.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select style={styleSelect} value={groupe} onChange={(e) => setGroupe(e.target.value)} aria-label="Groupe">
          <option value="">Tous les groupes</option>
          {groupes.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select style={styleSelect} value={departement} onChange={(e) => setDepartement(e.target.value)} aria-label="Département">
          <option value="">Tous les départements</option>
          {departements.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <input
          style={{ ...styleSelect, minWidth: 180 }}
          placeholder="Rechercher un poste…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {(chambre || elu || groupe || departement || q) && (
          <button type="button" onClick={reset} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", fontSize: "0.85rem", cursor: "pointer" }}>
            Réinitialiser
          </button>
        )}
      </div>
      <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: "0 0 24px" }}>
        {visibles.length} offre{visibles.length > 1 ? "s" : ""} {visibles.length !== offres.length ? "(filtrée" + (visibles.length > 1 ? "s" : "") + " sur " + offres.length + ")" : ""}
      </p>

      {/* ——— Cartes ——— */}
      {visibles.length === 0 ? (
        <p>Aucune offre ne correspond à ces critères.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 16 }}>
          {visibles.map((o) => (
            <li key={o.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <Link href={"/jobs/" + slugOffre(o)} style={{ display: "block", fontWeight: 600, fontSize: "1.05rem", marginBottom: 8, textDecoration: "none" }}>
                {titreStandard(o)}
              </Link>
              <p style={{ margin: "0 0 8px", color: "#6b7280", fontSize: "0.88rem" }}>
                {[o.type_poste, o.localisation].filter(Boolean).join(" · ")}
                {o.publie_le ? " · publiée le " + dateFr(o.publie_le) : ""}
              </p>
              {o.description && (
                <p style={{ margin: 0, color: "#374151" }}>
                  {o.description.length > 220 ? o.description.slice(0, 220) + "…" : o.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
