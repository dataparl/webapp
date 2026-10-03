import "server-only";
import { dataQuery, dataQueryTout } from "./data";

// Éditions manuelles des élus (espace d'administration admin.dataparl.fr/elus) :
// bios, mandats et fonctions créés à la main, en complément des données
// synchronisées chaque nuit. Le site ne lit que les lignes actives (RLS).

export type BioManuelle = { personne_id: string; texte: string; source: string; actif: boolean; maj_le: string };
export type MandatManuel = {
  id: string; personne_id: string; chambre: string; elu_id: string; libelle: string;
  circonscription: string; debut: string; fin: string; cause_fin: string; source: string; actif: boolean;
};
export type FonctionManuelle = {
  id: string; personne_id: string; chambre: string; type: string; code: string; libelle: string;
  sigle: string; fonction: string; debut: string; fin: string; source: string; actif: boolean;
};

const CHAMPS_COMMUNS = "id,personne_id,source,actif";

export async function editionsManuelles(personneId: string): Promise<{
  bio: BioManuelle | null;
  mandats: MandatManuel[];
  fonctions: FonctionManuelle[];
}> {
  const params = new URLSearchParams({ personne_id: `eq.${personneId}` });
  const [bios, mandats, fonctions] = await Promise.all([
    dataQuery<BioManuelle>(
      "bios",
      new URLSearchParams({ ...Object.fromEntries(params), select: `${CHAMPS_COMMUNS},texte,maj_le` }),
      3600,
    ),
    dataQueryTout<MandatManuel>(
      "mandats_manuels",
      new URLSearchParams({ ...Object.fromEntries(params), select: `${CHAMPS_COMMUNS},chambre,elu_id,libelle,circonscription,debut,fin,cause_fin`, order: "debut.desc" }),
    ),
    dataQueryTout<FonctionManuelle>(
      "fonctions_manuelles",
      new URLSearchParams({ ...Object.fromEntries(params), select: `${CHAMPS_COMMUNS},chambre,type,code,libelle,sigle,fonction,debut,fin`, order: "debut.desc" }),
    ),
  ]);
  return { bio: bios.rows[0] ?? null, mandats, fonctions };
}
