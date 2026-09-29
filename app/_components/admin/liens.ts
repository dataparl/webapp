"use client";

// Liens entre les deux espaces protégés, selon l'hôte courant :
// admin.cavaparlement.eu et webmail.cavaparlement.eu en production,
// /admin et /webmail ailleurs (localhost, aperçus).
export type Espace = "admin" | "webmail";

export function lien(espace: Espace, chemin = "/"): string {
  const host = typeof window === "undefined" ? "" : window.location.host;
  const prod = host.endsWith("cavaparlement.eu");
  const c = chemin === "/" ? "" : chemin;
  if (prod) return host.startsWith(`${espace}.`) ? chemin : `https://${espace}.cavaparlement.eu${chemin}`;
  return `/${espace}${c}`;
}
