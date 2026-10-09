import { CHAMBRE_LONG } from "@/lib/format";
import { dataQueryTout } from "@/lib/data";
import { CHAMBRE_COURTE } from "@/lib/collectifs";

// Page d'accueil des collaborateurs d'une chambre : la liste complète de la
// chambre, les entrées par parti et par groupe, la recherche des équipes,
// et pour le Parlement européen les tiers payants, prestataires et réseau.
const AU: Record<string, string> = { assemblee: "à l'Assemblée nationale", senat: "au Sénat", europarl: "au Parlement européen" };
const MOUVEMENTS: Record<string, string> = { assemblee: "/mouvements/assemblee", senat: "/mouvements/senat", europarl: "/mouvements/europarl" };

export default async function HubChambre({ chambre }: { chambre: "assemblee" | "senat" | "europarl" }) {
  const seg = CHAMBRE_COURTE[chambre];
  const enPoste = (await dataQueryTout<{ collab_id: string }>("periodes",
    new URLSearchParams({ select: "collab_id", chambre: "eq." + chambre, en_cours: "eq.true" }), 3600)
    .catch((): { collab_id: string }[] => [])).length;
  return (
    <>
      <p className="meta" style={{ marginTop: 0 }}>
        <a href="/collab">&larr; Tous les collaborateurs</a>
      </p>
      <h1>Les collaborateurs <span className="surligne">{CHAMBRE_LONG[chambre]}</span></h1>
      <p className="lead">
        {enPoste > 0
          ? enPoste.toLocaleString("fr-FR") + " collaborateurs parlementaires sont en poste " + AU[chambre] + ", d'après les données suivies quotidiennement par DataParl&apos;. "
          : "Qui travaille pour quel élu " + AU[chambre] + " : "}
        Retrouve la fiche d&apos;une personne, cherche par élu, parti ou groupe, et exporte une équipe en un clic.
      </p>
      <ul className="liste-deps">
        <li><a href={"/collab/" + seg + "/liste"}>La liste complète des collaborateurs en poste</a></li>
        <li><a href="/parti">Par parti politique</a> <span className="meta">· une fiche par parti : élus et équipes</span></li>
        <li><a href="/groupe">Par groupe parlementaire</a> <span className="meta">· une fiche par groupe : élus et équipes</span></li>
        <li><a href="/collab">Recherche par élu, groupe ou nom</a> <span className="meta">· compte gratuit, export CSV</span></li>
        {chambre === "europarl" && (
          <>
            <li><a href="/collab/pe/reseau">Le réseau des collaborateurs</a></li>
            <li><a href="/collab/pe/tiers-payants">Tiers payants</a></li>
            <li><a href="/collab/pe/prestataires">Prestataires de services</a></li>
          </>
        )}
        <li><a href={"/vigiparl/" + seg + "/parlementaires"}>VigiParl&apos; : le renouvellement des équipes, élu par élu</a></li>
        <li><a href={"/mixiparl/" + seg + "/parlementaires"}>MixiParl&apos; : la mixité des équipes, élue par élue</a></li>
        <li><a href={MOUVEMENTS[chambre]}>Les mouvements de la chambre, mois par mois</a></li>
      </ul>
    </>
  );
}
