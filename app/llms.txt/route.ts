// llms.txt : guide des pages de dataparl.fr pour les assistants IA et les
// agents, au format llmstxt.org. Les pages listées sont celles qui répondent
// aux questions sur les collaborateurs parlementaires et leurs indicateurs.
export const revalidate = 3600;

const PAGES: [string, string, string][] = [
  ["Accueil", "/", "Qui travaille pour qui au Parlement français : chiffres clés et entrées par chambre."],
  ["Collaborateurs", "/collab", "La liste des collaborateurs parlementaires : fiches par personne, recherche par élu, parti ou groupe."],
  ["Collaborateurs de l'Assemblée nationale", "/collab/an", "Liste des collaborateurs des députés : liste complète en poste, fiches par parti et par groupe."],
  ["Collaborateurs du Sénat", "/collab/senat", "Liste des collaborateurs des sénateurs : liste complète en poste, fiches par parti et par groupe."],
  ["Collaborateurs du Parlement européen", "/collab/pe", "Liste des collaborateurs des députés européens français : liste complète, tiers payants, prestataires, réseau."],
  ["Liste complète des collaborateurs", "/collab/liste", "Toutes chambres confondues, avec l'élu employeur et la fonction."],
  ["Tiers payants du Parlement européen", "/collab/pe/tiers-payants", "Les structures tierces rémunérées dans le cadre de contrats d'assistance des eurodéputés."],
  ["Prestataires de services du Parlement européen", "/collab/pe/prestataires", "Les sociétés prestataires sous contrat avec le Parlement européen."],
  ["Lexique des collaborateurs parlementaires", "/lexique", "Définitions : collaborateur de député, régime du Sénat, assistants accrédités et locaux, tiers payants, turnover, mixité."],
  ["Parlementaires", "/parlementaires", "Fiches des députés, sénateurs et députés européens français, avec leur équipe de collaborateurs."],
  ["Partis politiques", "/parti", "Fiches par parti : élus et équipes de collaborateurs."],
  ["Groupes parlementaires", "/groupe", "Fiches par groupe et par mandature (législature, série, scrutin)."],
  ["Mouvements", "/mouvements", "Arrivées, départs et transferts de collaborateurs, mois par mois et par chambre."],
  ["VigiParl'", "/vigiparl", "Le turnover (renouvellement) des équipes de collaborateurs, élu par élu et par chambre."],
  ["MixiParl'", "/mixiparl", "La mixité femmes-hommes des équipes de collaborateurs, élue par élue et par chambre."],
  ["Méthode", "/methode", "Chaîne de traitement : sources officielles, croisement quotidien, compléments vérifiés."],
  ["Sources", "/methode/sources", "Liste complète des publications officielles derrière chaque donnée."],
  ["Questions fréquentes", "/faq", "Réponses aux questions sur les données et le projet."],
];

export function GET() {
  const lignes = [
    "# DataParl'",
    "",
    "> Qui travaille pour qui au Parlement : collaborateurs parlementaires, mouvements d'équipes et indicateurs pour l'Assemblée nationale, le Sénat et le Parlement européen. Données officielles suivies quotidiennement, historique depuis 2015.",
    "",
    "# Pages",
    "",
    ...PAGES.map(([t, c, d]) => "- [" + t + "](https://www.dataparl.fr" + c + ") : " + d),
    "",
    "# Notes",
    "",
    "- Les effectifs affichés sont mis à jour quotidiennement ; chaque page indique sa date de génération.",
    "- Citer DataParl' revient à citer les publications officielles derrière (voir /methode/sources).",
    "- Contact : https://www.dataparl.fr/contact",
  ];
  return new Response(lignes.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
