import "server-only";
import { dataQueryTout } from "./data";

// Sénatoriales 2026 : renouvellement partiel du Sénat (septembre 2026).
// Les données viennent du référentiel (tables `parlementaires` et `mandats`,
// synchronisées chaque jour par dataparl/collaborateurs) :
// - nouveaux sénateurs : mandat au Sénat débutant à l'automne 2026 ;
// - sénateurs sortants : mandat de Sénat prenant fin à l'automne 2026
//   (les sortants réélus apparaissent dans les deux listes).

export const SCRUTIN_2026 = { annee: 2026, debut: "2026-09-01", fin: "2026-12-31" } as const;

const COLS_FICHE = "personne_id,elu_id,slug,civilite,prenom,nom,actif,departement,circonscription,groupe,groupe_libelle,photo_url,url_officielle";
const COLS_MANDAT = "personne_id,elu_id,debut,fin,libelle,circonscription,cause_fin";

export type Senateur = {
  personne_id: string; slug: string; prenom: string; nom: string; civilite: string;
  groupe: string; groupe_libelle: string; departement: string; circonscription: string;
  photo_url: string; url_officielle: string; actif: boolean;
  debut: string; fin: string; cause_fin: string;
};

export type DepartementScrutin = { nom: string; slug: string; nouveaux: Senateur[]; sortants: Senateur[] };

export type Senatoriales2026 = {
  departements: DepartementScrutin[]; // triés par nom
  nouveaux: Senateur[]; sortants: Senateur[]; reelus: Senateur[];
};

type Fiche = {
  personne_id: string; elu_id: string; slug: string; civilite: string; prenom: string; nom: string;
  actif: boolean; departement: string; circonscription: string; groupe: string; groupe_libelle: string;
  photo_url: string; url_officielle: string;
};
type Mandat = { personne_id: string; elu_id: string; debut: string; fin: string; libelle: string; circonscription: string; cause_fin: string };

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

const senateurDepuis = (f: Fiche | undefined, m: Mandat): Senateur => ({
  personne_id: m.personne_id, slug: f?.slug ?? m.personne_id, prenom: f?.prenom ?? "", nom: f?.nom ?? "",
  civilite: f?.civilite ?? "", groupe: f?.groupe ?? "", groupe_libelle: f?.groupe_libelle ?? "",
  departement: nomDepartement(f?.departement || m.circonscription), circonscription: m.circonscription ?? "",
  photo_url: f?.photo_url ?? "", url_officielle: f?.url_officielle ?? "", actif: f?.actif ?? true,
  debut: m.debut, fin: m.fin, cause_fin: m.cause_fin ?? "",
});

export async function senatoriales2026(): Promise<Senatoriales2026> {
  const [fiches, mandats] = await Promise.all([
    dataQueryTout<Fiche>("parlementaires", new URLSearchParams({ select: COLS_FICHE, chambre: "eq.senat" }), 3600),
    dataQueryTout<Mandat>("mandats", new URLSearchParams({ select: COLS_MANDAT, chambre: "eq.senat", order: "debut.desc" }), 3600),
  ]);
  const parPersonne = new Map(fiches.map((f) => [f.personne_id, f]));
  const nouveaux = mandats.filter((m) => m.debut >= SCRUTIN_2026.debut).map((m) => senateurDepuis(parPersonne.get(m.personne_id), m));
  const sortants = mandats.filter((m) => m.fin && m.fin >= SCRUTIN_2026.debut && m.fin <= SCRUTIN_2026.fin)
    .map((m) => senateurDepuis(parPersonne.get(m.personne_id), m));

  const parNom = new Map<string, DepartementScrutin>();
  const groupe = (s: Senateur): DepartementScrutin => {
    const nom = s.departement || "Sénat";
    let d = parNom.get(nom);
    if (!d) { d = { nom, slug: slugDepartement(nom), nouveaux: [], sortants: [] }; parNom.set(nom, d); }
    return d;
  };
  for (const s of nouveaux) groupe(s).nouveaux.push(s);
  for (const s of sortants) {
    const d = groupe(s);
    if (!d.sortants.some((x) => x.personne_id === s.personne_id)) d.sortants.push(s);
  }
  const cmp = (a: Senateur, b: Senateur) => a.nom.localeCompare(b.nom, "fr") || a.prenom.localeCompare(b.prenom, "fr");
  const departements = [...parNom.values()].map((d) => ({ ...d, nouveaux: [...d.nouveaux].sort(cmp), sortants: [...d.sortants].sort(cmp) }))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const idsNouveaux = new Set(nouveaux.map((s) => s.personne_id));
  const reelus = sortants.filter((s) => idsNouveaux.has(s.personne_id));
  return { departements, nouveaux, sortants, reelus };
}

// Un département précis (null s'il n'y a pas eu de scrutin connu pour ce slug).
export async function departementScrutin(slug: string): Promise<DepartementScrutin | null> {
  const { departements } = await senatoriales2026();
  return departements.find((d) => d.slug === slug) ?? null;
}

// Départements et collectivités d'outre-mer (et Français de l'étranger) :
// représentés sous la carte, pas dans le tracé métropolitain.
export const OUTRE_MER = [
  { code: "971", nom: "Guadeloupe" }, { code: "972", nom: "Martinique" }, { code: "973", nom: "Guyane" },
  { code: "974", nom: "La Réunion" }, { code: "975", nom: "Saint-Pierre-et-Miquelon" }, { code: "976", nom: "Mayotte" },
  { code: "987", nom: "Polynésie française" }, { code: "988", nom: "Nouvelle-Calédonie" },
  { code: "FDE", nom: "Français établis hors de France" },
] as const;
