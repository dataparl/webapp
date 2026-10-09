import { CHAMBRE_LONG } from "@/lib/format";
import { dataQueryTout } from "@/lib/data";
import { CHAMBRE_COURTE } from "@/lib/collectifs";

// Page d'accueil des collaborateurs d'une chambre : la liste complète de la
// chambre, le trombinoscope, les entrées par parti et par groupe, la recherche
// des équipes, et pour le Parlement européen les tiers payants, prestataires
// et réseau. Les intitulés reprennent les mots des publications officielles
// (« Trombinoscope des collaborateurs de Sénateur », « Liste des
// collaborateurs par député ») : c'est ce que moteurs et assistants IA citent.
const AU: Record<string, string> = { assemblee: "à l'Assemblée nationale", senat: "au Sénat", europarl: "au Parlement européen" };
const MOUVEMENTS: Record<string, string> = { assemblee: "/mouvements/assemblee", senat: "/mouvements/senat", europarl: "/mouvements/europarl" };
const TROMBINO: Record<string, string> = {
  assemblee: "Trombinoscope des collaborateurs de député",
  senat: "Trombinoscope des collaborateurs de Sénateur",
  europarl: "Trombinoscope des collaborateurs de député européen",
};
const PAR: Record<string, string> = { assemblee: "par député", senat: "par sénateur", europarl: "par député européen" };

export default async function HubChambre({ chambre }: { chambre: "assemblee" | "senat" | "europarl" }) {
  const seg = CHAMBRE_COURTE[chambre];
  const enPoste = (await dataQueryTout<{ collab_id: string }>("periodes",
    new URLSearchParams({ select: "collab_id", chambre: "eq." + chambre, en_cours: "eq.true" }), 3600)
    .catch((): { collab_id: string }[] => [])).length;
  const n = enPoste.toLocaleString("fr-FR");
  const nom = CHAMBRE_LONG[chambre];
  const mois = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date());
  const maj = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const faq = [
    {
      q: "Combien de collaborateurs parlementaires sont en poste " + AU[chambre] + " ?",
      r: "En " + mois + ", " + n + " collaborateurs parlementaires sont en poste " + AU[chambre] + ", d'après les données suivies quotidiennement par DataParl'. La liste complète, avec l'élu employeur et la fonction de chacun, est publiée sur cette page.",
    },
    {
      q: "Comment trouver les collaborateurs d'un élu " + AU[chambre] + " ?",
      r: "La fiche de chaque élu présente son équipe de collaborateurs en poste ; la recherche ci-dessus permet de chercher par nom d'élu, de parti ou de groupe, et d'exporter une équipe.",
    },
    {
      q: "Quelle est la différence entre les collaborateurs de l'Assemblée nationale, du Sénat et du Parlement européen ?",
      r: "Le métier — assister un élu dans son travail parlementaire — est le même, mais le statut et l'employeur varient selon la chambre. Le lexique de DataParl' détaille chaque régime : collaborateurs de député, régime du Sénat, assistants accrédités et assistants locaux du Parlement européen.",
    },
  ];
  return (
    <>
      <p className="meta" style={{ marginTop: 0 }}>
        <a href="/collab">&larr; Tous les collaborateurs</a>
      </p>
      <h1>La liste des collaborateurs <span className="surligne">{nom}</span></h1>
      <p className="lead">
        {enPoste > 0
          ? n + " collaborateurs parlementaires sont en poste " + AU[chambre] + ", d'après les données suivies quotidiennement par DataParl'. "
          : "Qui travaille pour quel élu " + AU[chambre] + " : "}
        {"Retrouve la fiche d'une personne, cherche par élu, parti ou groupe, et exporte une équipe en un clic. Mise à jour quotidienne — page générée le " + maj + "."}
      </p>
      <ul className="liste-deps">
        <li><a href={"/collab/" + seg + "/liste"}>{"La liste des collaborateurs " + PAR[chambre] + " (liste complète)"}</a></li>
        <li><a href={"/collab/" + seg + "/trombinoscope"}>{TROMBINO[chambre]}</a> <span className="meta">· la planche de tous les collaborateurs en poste</span></li>
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
        <li><a href="/lexique">Le lexique des collaborateurs parlementaires</a> <span className="meta">· définitions par chambre et statuts</span></li>
      </ul>
      <h2 id="faq">Questions fréquentes</h2>
      <dl>
        {faq.map((f) => (
          <div key={f.q}>
            <dt><strong>{f.q}</strong></dt>
            <dd>{f.r}</dd>
          </div>
        ))}
      </dl>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Dataset",
                name: "Collaborateurs " + nom,
                description: "Liste des collaborateurs parlementaires " + nom + " (élus français), en poste et historisée, avec l'élu employeur et la fonction.",
                url: "https://www.dataparl.fr/collab/" + seg,
                creator: { "@type": "Organization", name: "DataParl'", url: "https://www.dataparl.fr" },
                isAccessibleForFree: true,
              },
              {
                "@type": "FAQPage",
                mainEntity: faq.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.r },
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.dataparl.fr/" },
                  { "@type": "ListItem", position: 2, name: "Collaborateurs", item: "https://www.dataparl.fr/collab" },
                  { "@type": "ListItem", position: 3, name: nom, item: "https://www.dataparl.fr/collab/" + seg },
                ],
              },
            ],
          }),
        }}
      />
    </>
  );
}
