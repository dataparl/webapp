"use client";

// Liens entre les deux espaces protégés, selon l'hôte courant :
// admin.dataparl.fr et webmail.dataparl.fr en production,
// /admin et /webmail ailleurs (localhost, aperçus).
export type Espace = "admin" | "webmail";

export function lien(espace: Espace, chemin = "/"): string {
  const host = typeof window === "undefined" ? "" : window.location.host;
  const prod = host.endsWith("dataparl.fr");
  const c = chemin === "/" ? "" : chemin;
  if (prod) return host.startsWith(`${espace}.`) ? chemin : `https://${espace}.dataparl.fr${chemin}`;
  return `/${espace}${c}`;
}
