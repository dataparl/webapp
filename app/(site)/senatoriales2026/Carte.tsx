"use client";

// Carte cliquable et zoomable des départements métropolitains (contours de
// lib/carteDepartements.ts) : en bleu, les départements renouvelés aux
// sénatoriales 2026 ; l'outre-mer est listé sous la carte.
import { useState } from "react";
import { DEPARTEMENTS, VIEWBOX } from "@/lib/carteDepartements";

export type DonneesDep = { n: number; s: number };

const FACTEUR = 1.35;
const [X0, Y0, L0, H0] = VIEWBOX.split(" ").map(Number);
const INITIAL = { x: X0, y: Y0, l: L0, h: H0 };
const MIN = 90; // zoom max ~11x
const MAX = L0 * 1.05; // dézoom léger au-delà de la vue initiale

function zoomer(v: { x: number; y: number; l: number; h: number }, sens: 1 | -1) {
  const l = sens > 0 ? Math.max(MIN, v.l / FACTEUR) : Math.min(MAX, v.l * FACTEUR);
  const h = l * (H0 / L0);
  const cx = v.x + v.l / 2;
  const cy = v.y + v.h / 2;
  return { x: cx - l / 2, y: cy - h / 2, l, h };
}

export default function Carte({ parSlug, om }: { parSlug: Record<string, DonneesDep>; om: { nom: string; slug: string; n: number }[] }) {
  const [vue, setVue] = useState(INITIAL);

  return (
    <figure className="carte-fr" style={{ margin: 0 }}>
      <div className="carte-outils" style={{ display: "flex", gap: 8, alignItems: "center", margin: "0 0 8px" }}>
        <button type="button" onClick={() => setVue((v) => zoomer(v, 1))} aria-label="Zoomer sur la carte">
          ＋ Zoom
        </button>
        <button type="button" onClick={() => setVue((v) => zoomer(v, -1))} aria-label="Dézoomer la carte">
          － Dézoom
        </button>
        <button type="button" onClick={() => setVue(INITIAL)} aria-label="Réinitialiser le zoom de la carte">
          ↺ Réinitialiser
        </button>
      </div>
      <svg
        viewBox={`${vue.x} ${vue.y} ${vue.l} ${vue.h}`}
        role="group"
        aria-label="Carte des départements français renouvelés aux sénatoriales 2026"
        style={{ touchAction: "none" }}
      >
        {DEPARTEMENTS.map((d) => {
          const data = parSlug[d.slug];
          const renouvelle = (data?.n ?? 0) > 0;
          const label = `${d.nom}${renouvelle ? ` : ${data!.n} nouveau${data!.n > 1 ? "x" : ""} sénateur${data!.n > 1 ? "s" : ""}` : ""}`;
          return (
            <a key={d.code} href={renouvelle ? `/senatoriales2026/${d.slug}` : undefined} aria-label={label || d.nom}>
              <path
                className={`dep${renouvelle ? " renouvele" : ""}`}
                d={d.d}
                role="img"
                aria-hidden="true"
              >
                <title>{label || `${d.nom} : pas de renouvellement en 2026`}</title>
              </path>
            </a>
          );
        })}
      </svg>
      {om.length > 0 && (
        <figcaption>
          <p className="meta" style={{ margin: "8px 0 4px" }}>Outre-mer et Français de l&apos;étranger :</p>
          <div className="doms">
            {om.map((o) => (
              <a key={o.slug} className="dom" href={`/senatoriales2026/${o.slug}`}>
                {o.nom} <span className="meta">· {o.n} nouveau{o.n > 1 ? "x" : ""}</span>
              </a>
            ))}
          </div>
        </figcaption>
      )}
    </figure>
  );
}
