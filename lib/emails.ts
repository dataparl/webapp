// Adresses email DÉDUITES à partir des règles de nommage des assemblées.
// Elles ne sont publiées par aucune institution : elles sont toujours
// présentées comme « adresse déduite, non vérifiée ».

const ascii = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Nom de famille : repris en entier, les espaces deviennent des traits d'union,
// apostrophes et caractères non alphanumériques retirés.
function nomLocal(nom: string): string {
  return ascii(nom).replace(/['’]/g, "").trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

// Sénat : initiale(s) du prénom accolées + « . » + nom @clb.senat.fr
//   Jean-Pierre Martin -> jp.martin ; Anne Renaud-Garabedian -> a.renaud-garabedian
export function emailCollabSenat(prenom: string, nom: string): string | null {
  const initiales = ascii(prenom).split(/[\s-]+/).map((p) => p.replace(/[^a-z]/g, "")[0] ?? "").join("");
  const n = nomLocal(nom);
  return initiales && n ? `${initiales}.${n}@clb.senat.fr` : null;
}

// Assemblée nationale : prénom(s) entier(s) reliés par un trait d'union + « . » + nom @clb-an.fr
//   Jean-Pierre Martin -> jean-pierre.martin ; Bastien Rosso-Cadetto -> bastien.rosso-cadetto
export function emailCollabAN(prenom: string, nom: string): string | null {
  const p = nomLocal(prenom);
  const n = nomLocal(nom);
  return p && n ? `${p}.${n}@clb-an.fr` : null;
}

export function emailCollab(chambre: string, prenom: string, nom: string): string | null {
  if (chambre === "senat") return emailCollabSenat(prenom, nom);
  if (chambre === "assemblee") return emailCollabAN(prenom, nom);
  return null;
}

// Élus : mêmes conventions, domaines des assemblées.
export function emailElu(chambre: string, eluNom: string): string | null {
  const toks = eluNom.trim().split(/\s+/);
  if (toks.length < 2) return null;
  if (chambre === "senat") {
    // « Pascal ALLIZARD » : le nom est en capitales
    const i = toks.findIndex((t) => t === t.toUpperCase() && /\p{L}{2}/u.test(t));
    if (i <= 0) return null;
    const e = emailCollabSenat(toks.slice(0, i).join(" "), toks.slice(i).join(" "));
    return e ? e.replace("@clb.senat.fr", "@senat.fr") : null;
  }
  if (chambre === "assemblee") {
    // « Émeline K/Bidi » : premier mot = prénom (les prénoms composés portent un trait d'union)
    const e = emailCollabAN(toks[0], toks.slice(1).join(" "));
    return e ? e.replace("@clb-an.fr", "@assemblee-nationale.fr") : null;
  }
  return null;
}
