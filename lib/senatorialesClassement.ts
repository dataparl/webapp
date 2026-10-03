// Sénatoriales 2026 : classement des sénateurs (nouveaux, réélus, sortants).
// Logique pure, sans « server-only », pour être testée hors Next
// (cf. lib/senatoriales.test.ts). Les données viennent des tables
// `parlementaires` et `mandats` synchronisées par dataparl/collaborateurs.

export const SCRUTIN_2026 = { annee: 2026, election: "2026-09-27", debut: "2026-09-01", fin: "2026-12-31" } as const;

// Libellé français de la date du scrutin : « 27 septembre 2026 ».
export function libelleElection(): string {
  const [, m, j] = SCRUTIN_2026.election.split("-");
  const mois = ["", "janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  return `${Number(j)} ${mois[Number(m)]} ${SCRUTIN_2026.annee}`;
}

// Un élu officiel du scrutin 2026 (liste publiée par le ministère de
// l'Intérieur, générée dans lib/scrutin2026Officiel.ts).
export type EluOfficiel = {
  civilite: string; prenom: string; nom: string;
  nom_complet?: string; departement: string; liste?: string;
};

export type Senateur = {
  personne_id: string; slug: string; prenom: string; nom: string; civilite: string;
  groupe: string; groupe_libelle: string; departement: string; circonscription: string;
  photo_url: string; url_officielle: string; actif: boolean;
  debut: string; fin: string; cause_fin: string;
  liste: string;       // liste électorale de la liste officielle (si connue)
  election: string;   // date d'élection ISO (élus du scrutin uniquement)
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
    liste: "", election: "",
  };
}

// Nom normalisé pour rapprocher la liste officielle (majuscules, accents,
// tirets) des fiches de la base : « Jean-Pierre » ≡ « Jean Pierre ».
export function nomNormalise(prenom: string, nom: string): string {
  return `${prenom}${nom}`.normalize("NFD").replace(/\p{M}/gu, "").replace(/['’\s-]/g, "").toUpperCase();
}

export type ClassementScrutin = { nouveaux: Senateur[]; reelus: Senateur[]; sortants: Senateur[] };

// Classe les mandats du Sénat pour le scrutin 2026 :
// - entrants : mandat débutant dans la fenêtre du scrutin (début effectif) ;
//   ceux qui ont déjà siégé au Sénat avant le scrutin sont « réélus »,
//   les autres sont de « vrais nouveaux » ;
// - sortants : mandat prenant fin dans la fenêtre du scrutin.
// Une personne n'apparaît qu'une fois par liste (premier mandat trouvé).
//
// La liste officielle (ministère de l'Intérieur, 178 élus du 27 septembre 2026)
// complète le référentiel, dont la synchronisation peut être en retard :
// - un élu officiel absent des mandats 2026 apparaît quand même (réélu s'il
//   avait déjà siégé, sinon nouveau) ;
// - un sénateur en fin de mandat qui figure dans la liste officielle n'est pas
//   compté parmi les sortants : il a été réélu.
export function classerScrutin(fiches: FicheScrutin[], mandats: MandatScrutin[], officiels: EluOfficiel[] = []): ClassementScrutin {
  const parPersonne = new Map(fiches.map((f) => [f.personne_id, f]));
  const dansScrutin = (d: string) => !!d && d >= SCRUTIN_2026.debut && d <= SCRUTIN_2026.fin;

  // Rapprochement nom normalisé → fiche, pour la liste officielle (défini plus
  // bas, au moment de s'en servir).

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

  // Élus officiels non couverts par les mandats 2026 : le référentiel est en
  // retard (mandat du scrutin pas encore synchronisé, ou fiche absente).
  // Rapprochement en deux passes : nom complet normalisé (accents, majuscules,
  // tirets), puis nom de famille + initiale du prénom — la liste officielle
  // contient quelques coquilles (« Chistine BOST » pour Christine Bost).
  const officielsIds = new Set<string>();
  const parNomNorm = new Map<string, FicheScrutin>();
  for (const f of fiches) {
    const cle = nomNormalise(f.prenom, f.nom);
    if (!parNomNorm.has(cle)) parNomNorm.set(cle, f);
  }
  const ficheOfficielle = (o: EluOfficiel): FicheScrutin | undefined =>
    parNomNorm.get(nomNormalise(o.prenom, o.nom)) ??
    [...parNomNorm.values()].find((f) => nomNormalise("", f.nom) === nomNormalise("", o.nom) && f.prenom[0] === o.prenom[0]);
  const officielDeFiche = new Map<string, EluOfficiel>();
  for (const o of officiels) {
    const f = ficheOfficielle(o);
    if (f) { officielsIds.add(f.personne_id); officielDeFiche.set(f.personne_id, o); }
  }
  // Enrichit les entrants déjà connus : liste électorale + date d'élection.
  for (const s of entrants) {
    const o = officielDeFiche.get(s.personne_id);
    if (o) { s.liste = o.liste ?? ""; s.election = SCRUTIN_2026.election; }
  }
  for (const o of officiels) {
    const f = ficheOfficielle(o);
    const id = f?.personne_id;
    if (id && idsEntrants.has(id)) continue;
    const s: Senateur = id
      ? { ...senateurDepuis(f, { personne_id: id, elu_id: f!.elu_id, debut: dansScrutin(f!.premier_mandat ?? "") ? f!.premier_mandat! : "", fin: "", circonscription: f!.circonscription }), liste: o.liste ?? "", election: SCRUTIN_2026.election }
      : {
          personne_id: `OFF-${nomNormalise(o.prenom, o.nom)}`, slug: "", prenom: o.prenom, nom: o.nom, civilite: o.civilite,
          groupe: "", groupe_libelle: "", departement: nomDepartement(o.departement), circonscription: o.departement,
          photo_url: "", url_officielle: "", actif: true, debut: "", fin: "", cause_fin: "",
          liste: o.liste ?? "", election: SCRUTIN_2026.election,
        };
    if (id) idsEntrants.add(id);
    entrants.push(s);
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
  // personne. Sont exclus les élus du scrutin (réélus ou nouveaux entrants
  // dès 2026) : leur mandat précédent prend bien fin, mais ils restent
  // au Sénat — les réélus sont listés dans leur propre section.
  const idsSortants = new Set<string>();
  const sortants: Senateur[] = [];
  for (const m of mandats) {
    if (idsSortants.has(m.personne_id)) continue;
    if (!(m.fin && m.fin >= SCRUTIN_2026.debut && m.fin <= SCRUTIN_2026.fin)) continue;
    idsSortants.add(m.personne_id);
    sortants.push(senateurDepuis(parPersonne.get(m.personne_id), m));
  }
  const resteAuSénat = (s: Senateur) => idsReelus.has(s.personne_id) || officielsIds.has(s.personne_id);
  const cmp = (a: Senateur, b: Senateur) => a.nom.localeCompare(b.nom, "fr") || a.prenom.localeCompare(b.prenom, "fr");

  return {
    nouveaux: nouveaux.sort(cmp),
    reelus: reelus.sort(cmp),
    sortants: sortants.filter((s) => !resteAuSénat(s)),
  };
}
