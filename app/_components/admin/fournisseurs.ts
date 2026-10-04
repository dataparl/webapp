// Libellés des moyens de connexion (providers Supabase Auth).
export const LIBELLE_FOURNISSEURS: Record<string, string> = {
  email: "Email / mot de passe",
  google: "Google",
  github: "GitHub",
  gitlab: "GitLab",
  apple: "Apple",
  azure: "Microsoft",
  linkedin: "LinkedIn",
  keycloak: "Keycloak",
};

export const libelleFournisseur = (f: string) => LIBELLE_FOURNISSEURS[f] ?? (f ? f[0].toUpperCase() + f.slice(1) : "");

// Liste de libellés prête à afficher, passkeys en plus.
export const libellesFournisseurs = (fs: string[] | null | undefined, passkeys = 0) => {
  const liste = (fs ?? []).map(libelleFournisseur).filter(Boolean);
  if (passkeys > 0) liste.push(passkeys === 1 ? "1 passkey" : `${passkeys} passkeys`);
  return liste;
};
