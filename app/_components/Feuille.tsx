"use client";
import { useMemo, useState } from "react";
import type { Colonne, Ligne } from "@/lib/sheets";

// Feuille interactive : recherche plein texte, tri par colonne, export CSV et
// copie du lien. Formatage local (fr-FR), aucun calcul côté serveur requis.

function fmt(v: string | number | null, genre: Colonne["genre"]): string {
  if (v === null || v === undefined || v === "") return "–";
  if (genre === "texte") return String(v);
  const x = Number(v);
  if (Number.isNaN(x)) return String(v);
  if (genre === "entier") return x.toLocaleString("fr-FR");
  if (genre === "pourcent") return (x * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + " %";
  return x.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

export default function Feuille({ titre, description, provenance, colonnes, lignes }: {
  titre: string; description: string; provenance: string; colonnes: Colonne[]; lignes: Ligne[];
}) {
  const [q, setQ] = useState("");
  const [tri, setTri] = useState<{ cle: string; sens: 1 | -1 } | null>(null);

  const visibles = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = needle
      ? lignes.filter((l) => colonnes.some((c) => String(l[c.cle] ?? "").toLowerCase().includes(needle)))
      : lignes;
    if (tri) {
      const { cle, sens } = tri;
      out = [...out].sort((a, b) => {
        const x = a[cle], y = b[cle];
        const num = typeof x === "number" && typeof y === "number";
        return (num ? x - y : String(x ?? "").localeCompare(String(y ?? ""), "fr")) * sens;
      });
    }
    return out;
  }, [q, tri, lignes, colonnes]);

  function trier(cle: string) {
    setTri((t) => (t?.cle === cle ? (t.sens === 1 ? { cle, sens: -1 } : null) : { cle, sens: 1 }));
  }

  function telechargerCsv() {
    const esc = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      colonnes.map((c) => esc(c.label)).join(";"),
      ...visibles.map((l) => colonnes.map((c) => esc(l[c.cle])).join(";")),
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = `${titre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <p className="meta"><a href="/sheets">DataParl&apos; Sheets</a></p>
      <h1>{titre}</h1>
      <p className="lead">{description}</p>
      <p className="meta">Source : {provenance}. Licence ODbL — libre réutilisation avec mention DataParl&apos;.</p>

      <div className="feuille-outils">
        <input type="text" placeholder="Filtrer les lignes…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filtrer les lignes" />
        <span className="meta">{visibles.length.toLocaleString("fr-FR")} / {lignes.length.toLocaleString("fr-FR")} ligne{visibles.length > 1 ? "s" : ""}</span>
        <button className="secondaire" onClick={telechargerCsv}>Télécharger (CSV)</button>
        <button className="secondaire" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Copier le lien</button>
      </div>

      <div className="defile feuille">
        <table className="stats">
          <thead>
            <tr>
              {colonnes.map((c) => (
                <th key={c.cle} className={c.genre === "texte" ? "" : "num"} aria-sort={tri?.cle === c.cle ? (tri.sens === 1 ? "ascending" : "descending") : undefined}>
                  <button className="lien tri" onClick={() => trier(c.cle)} title="Trier">
                    {c.label}{tri?.cle === c.cle ? (tri.sens === 1 ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibles.map((l, i) => (
              <tr key={i}>
                {colonnes.map((c) => (
                  <td key={c.cle} className={c.genre === "texte" ? "" : "num"}>{fmt(l[c.cle], c.genre)}</td>
                ))}
              </tr>
            ))}
            {visibles.length === 0 && <tr><td colSpan={colonnes.length} className="meta">Aucune ligne ne correspond au filtre.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
