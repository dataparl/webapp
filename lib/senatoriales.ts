import "server-only";
import { dataQueryTout } from "./data";
import {
  SCRUTIN_2026, classerScrutin, nomDepartement, senateurDepuis, slugDepartement,
  type FicheScrutin, type MandatScrutin, type Senateur,
} from "./senatorialesClassement";
import { ELUS_OFFICIELS_2026 } from "./scrutin2026Officiel";

// Sénatoriales 2026 : renouvellement partiel du Sénat (septembre 2026).
// Le classement (nouveaux / réélus / sortants) est une fonction pure testée
// dans lib/senatoriales.test.ts ; ce module n'est que le chargement des
// données du référentiel et le regroupement par département.

export { SCRUTIN_2026, slugDepartement, nomDepartement };
export type { Senateur };

export type DepartementScrutin = { nom: string; slug: string; nouveaux: Senateur[]; reelus: Senateur[]; sortants: Senateur[] };

export type Senatoriales2026 = {
  departements: DepartementScrutin[]; // triés par nom
  nouveaux: Senateur[]; sortants: Senateur[]; reelus: Senateur[];
};

const COLS_FICHE = "personne_id,elu_id,slug,civilite,prenom,nom,actif,departement,circonscription,groupe,groupe_libelle,photo_url,url_officielle,premier_mandat";
const COLS_MANDAT = "personne_id,elu_id,debut,fin,libelle,circonscription,cause_fin";

export async function senatoriales2026(): Promise<Senatoriales2026> {
  const [fiches, mandats] = await Promise.all([
    dataQueryTout<FicheScrutin>("parlementaires", new URLSearchParams({ select: COLS_FICHE, chambre: "eq.senat" }), 3600),
    dataQueryTout<MandatScrutin>("mandats", new URLSearchParams({ select: COLS_MANDAT, chambre: "eq.senat", order: "debut.desc" }), 3600),
  ]);
  const { nouveaux, reelus, sortants } = classerScrutin(fiches, mandats, ELUS_OFFICIELS_2026);

  const parNom = new Map<string, DepartementScrutin>();
  const groupe = (s: Senateur): DepartementScrutin => {
    const nom = s.departement || "Sénat";
    let d = parNom.get(nom);
    if (!d) { d = { nom, slug: slugDepartement(nom), nouveaux: [], reelus: [], sortants: [] }; parNom.set(nom, d); }
    return d;
  };
  for (const s of nouveaux) groupe(s).nouveaux.push(s);
  for (const s of reelus) groupe(s).reelus.push(s);
  for (const s of sortants) groupe(s).sortants.push(s);
  const cmp = (a: Senateur, b: Senateur) => a.nom.localeCompare(b.nom, "fr") || a.prenom.localeCompare(b.prenom, "fr");
  const departements = [...parNom.values()]
    .map((d) => ({ ...d, nouveaux: [...d.nouveaux].sort(cmp), reelus: [...d.reelus].sort(cmp), sortants: [...d.sortants].sort(cmp) }))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
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
