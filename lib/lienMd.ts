// Rendu React d’une ligne pouvant contenir des liens Markdown :
// [texte](https://example.fr) ou [texte](mailto:a@b.fr). Le reste est du
// texte brut (React échappe lui-même). Page publique des communiqués.
import { createElement, type ReactNode } from "react";

const LIEN = /\[([^\]\[]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g;

export function liensMd(ligne: string): ReactNode[] {
  const out: ReactNode[] = [];
  let dernier = 0;
  for (const m of ligne.matchAll(LIEN)) {
    const i = m.index!;
    if (i > dernier) out.push(ligne.slice(dernier, i));
    out.push(createElement("a", { key: i, href: m[2] }, m[1]));
    dernier = i + m[0].length;
  }
  if (dernier < ligne.length) out.push(ligne.slice(dernier));
  return out;
}
