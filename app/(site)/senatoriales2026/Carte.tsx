"use client";

// Carte cliquable des départements métropolitains (contours de
// lib/carteDepartements.ts) : en bleu, les départements renouvelés aux
// sénatoriales 2026 ; l'outre-mer est listé sous la carte.
import { DEPARTEMENTS, VIEWBOX } from "@/lib/carteDepartements";

export type DonneesDep = { n: number; s: number };

export default function Carte({ parSlug, om }: { parSlug: Record<string, DonneesDep>; om: { nom: string; slug: string; n: number }[] }) {
  return (
    <figure className="carte-fr" style={{ margin: 0 }}>
      <svg viewBox={VIEWBOX} role="group" aria-label="Carte des départements français renouvelés aux sénatoriales 2026">
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
