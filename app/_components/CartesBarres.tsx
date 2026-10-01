"use client";
import { useState } from "react";

// Cartes à barre horizontale : une carte par famille ou par groupe, la barre
// proportionnelle au taux, le chiffre exact toujours visible, le nombre d'élus
// cliquable. Bascule entre les vues sans rechargement.
export type CarteBarre = {
  id: string; libelle: string; detail?: string; section?: string;
  taux: number | null; valeur: string; complement?: string; elus: number; href: string;
};
export type VueBarres = { cle: string; titre: string; note?: string; lignes: CarteBarre[] };

export default function CartesBarres({ vues, couleur, entete, max = 1 }: { vues: VueBarres[]; couleur: "vigi" | "mixi"; entete: string; max?: number }) {
  const [active, setActive] = useState(vues[0]?.cle);
  const vue = vues.find((v) => v.cle === active) ?? vues[0];
  if (!vue) return null;
  return (
    <div className="cartes-barres">
      {vues.length > 1 && (
        <div className="bascule" role="group" aria-label="Regroupement">
          {vues.map((v) => (
            <button key={v.cle} type="button" aria-pressed={v.cle === vue.cle} onClick={() => setActive(v.cle)}>{v.titre}</button>
          ))}
        </div>
      )}
      {vue.note && <p className="meta">{vue.note}</p>}
      <div className="cb-entete" aria-hidden="true"><span>{vue.titre.replace(/^Par /, "")}</span><span>{entete}</span><span>Élus</span></div>
      <ul>
        {vue.lignes.map((l, i) => (
          <li key={l.id} id={l.id} className="carte-barre">
            {l.section && l.section !== vue.lignes[i - 1]?.section && <span className="cb-section">{l.section}</span>}
            <span className="cb-libelle"><strong>{l.libelle}</strong>{l.detail && <span className="meta"> {l.detail}</span>}</span>
            <span className={`barre ${couleur}`} role="img" aria-label={`${l.valeur}`}><span style={{ width: `${Math.min(100, ((l.taux ?? 0) / max) * 100)}%` }} /></span>
            <span className="cb-valeur">{l.valeur}{l.complement && <span className="meta">{l.complement}</span>}</span>
            <a className="cb-elus" href={l.href} aria-label={`${l.elus} élus : voir le classement`}>{l.elus.toLocaleString("fr-FR")} ▸</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
