// Sénatoriales 2026 : classement des sénateurs (nouveaux, réélus, sortants).
// Logique pure, sans « server-only », pour être testée hors Next
// (cf. lib/senatoriales.test.ts). Les données viennent des tables
// `parlementaires` et `mandats` synchronisées par dataparl/collaborateurs.

export const SCRUTIN_2026 = { annee: 2026, debut: "2026-09-01", fin: "2026-12-31" } as const;

export type Senateur = {
  personne_id: string; slug: string; prenom: string; nom: string; civilite: string;
  groupe: string; groupe_libelle: string; departement: string; circonscription: string;
  photo_url: string; url_officielle: string; actif: boolean;
  debut: string; fin: string; cause_fin: string;
};

export type FicheScrutin = {
  personne_id: string; elu_id: string; slug: string; civilite: string; prenom: string; nom: string;
  actif: boolean; departement: string; circonscription: string; groupe: string; groupe_libelle: string;
  photo_url: string; url_officielle: string;
  // `premier_mandat` rattrape les mandats au `debut` vide (scrutin 2026).
  premier_mandat?: string;
};

export type MandatScrutin = {
  personne_id: string; elu_id: string; debut: string; fin: string;
  libelle?: string; circonscription: string; cause_fin?: string;
};

// Slug d'URL d'un département : « Gironde » -> « gironde », « Seine-Saint-Denis » -> « seine-saint-denis ».
export function slugDepartement(nom: string): string {
  return (nom || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Le champ `departement` peut contenir un préfixe de code (« 33 - Gironde »).
export function nomDepartement(brut: string): string {
  const t = (brut || "").trim();
  return t.replace(/^\d{2,3}[a-b]?\s*[-–]\s*/i, "").trim() || t;
}

// Début effectif d'un mandat : environ 70 mandats du scrutin 2026 ont un `debut`
// vide dans la table `mandats` ; la fiche du parlementaire porte alors la date
// réelle d'entrée en fonction dans `premier_mandat` (ex. « 2026-10-01 »).
export function debutEffectif(f: FicheScrutin | undefined, m: MandatScrutin): string {
  return m.debut || f?.premier_mandat || "";
}

export function senateurDepuis(f: FicheScrutin | undefined, m: MandatScrutin): Senateur {
  return {
    personne_id: m.personne_id, slug: f?.slug ?? m.personne_id, prenom: f?.prenom ?? "", nom: f?.nom ?? "",
    civilite: f?.civilite ?? "", groupe: f?.groupe ?? "", groupe_libelle: f?.groupe_libelle ?? "",
    departement: nomDepartement(f?.departement || m.circonscription), circonscription: m.circonscription ?? "",
    photo_url: f?.photo_url ?? "", url_officielle: f?.url_officielle ?? "", actif: f?.actif ?? true,
    debut: debutEffectif(f, m), fin: m.fin ?? "", cause_fin: m.cause_fin ?? "",
  };
}

export type ClassementScrutin = { nouveaux: Senateur[]; reelus: Senateur[]; sortants: Senateur[] };

// Classe les mandats du Sénat pour le scrutin 2026 :
// - entrants : mandat débutant dans la fenêtre du scrutin (début effectif) ;
//   ceux qui ont déjà siégé au Sénat avant le scrutin sont « réélus »,
//   les autres sont de « vrais nouveaux » ;
// - sortants : mandat prenant fin dans la fenêtre du scrutin.
// Une personne n'apparaît qu'une fois par liste (premier mandat trouvé).
export function classerScrutin(fiches: FicheScrutin[], mandats: MandatScrutin[]): ClassementScrutin {
  const parPersonne = new Map(fiches.map((f) => [f.personne_id, f]));
  const dansScrutin = (d: string) => !!d && d >= SCRUTIN_2026.debut && d <= SCRUTIN_2026.fin;

  // Entrants : mandat débutant pendant le scrutin, dédupliqués par personne.
  const idsEntrants = new Set<string>();
  const entrants: Senateur[] = [];
  for (const m of mandats) {
    if (idsEntrants.has(m.personne_id)) continue;
    const f = parPersonne.get(m.personne_id);
    if (!dansScrutin(debutEffectif(f, m))) continue;
    idsEntrants.add(m.personne_id);
    entrants.push(senateurDepuis(f, m));
  }

  // Réélus : parmi les entrants, ceux qui avaient déjà un mandat au Sénat
  // commencé avant le scrutin (Hervé Gillé en Gironde, par exemple).
  const reelus = entrants.filter((s) =>
    mandats.some((m) =>
      m.personne_id === s.personne_id &&
      !!debutEffectif(parPersonne.get(m.personne_id), m) &&
      debutEffectif(parPersonne.get(m.personne_id), m) < SCRUTIN_2026.debut,
    ),
  );
  const idsReelus = new Set(reelus.map((s) => s.personne_id));
  const nouveaux = entrants.filter((s) => !idsReelus.has(s.personne_id));

  // Sortants : mandat terminé dans la fenêtre du scrutin, dédupliqués par
  // personne. Les réélus sont exclus : leur mandat précédent prend bien fin,
  // mais ils restent au Sénat — ils sont listés dans leur propre section.
  const idsSortants = new Set<string>();
  const sortants: Senateur[] = [];
  for (const m of mandats) {
    if (idsSortants.has(m.personne_id)) continue;
    if (!(m.fin && m.fin >= SCRUTIN_2026.debut && m.fin <= SCRUTIN_2026.fin)) continue;
    idsSortants.add(m.personne_id);
    sortants.push(senateurDepuis(parPersonne.get(m.personne_id), m));
  }
  const idsSortantsReelus = new Set(sortants.filter((s) => idsReelus.has(s.personne_id)).map((s) => s.personne_id));
  const cmp = (a: Senateur, b: Senateur) => a.nom.localeCompare(b.nom, "fr") || a.prenom.localeCompare(b.prenom, "fr");

  return {
    nouveaux: nouveaux.sort(cmp),
    reelus: reelus.sort(cmp),
    sortants: sortants.filter((s) => !idsSortantsReelus.has(s.personne_id)),
  };
}
