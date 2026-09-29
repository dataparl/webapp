import type { Metadata } from "next";

export const metadata: Metadata = { title: "Espace presse" };

export default function EspacePresse() {
  return (
    <>
      <h1>Espace <span className="surligne">presse</span></h1>
      <p className="lead">
        DataParl&apos; suit au jour le jour les collaborateurs des députés, sénateurs et eurodéputés, à partir des
        publications officielles. Données et méthode sont ouvertes : n&apos;hésitez pas à les citer et à nous solliciter.
      </p>
      <ul className="sommaire">
        <li><a href="/espace-presse/communiques"><strong>Communiqués</strong><span>Nos annonces et publications →</span></a></li>
        <li><a href="/contact?sujet=presse"><strong>Contact presse</strong><span>Demande d&apos;interview, de données ou de précisions →</span></a></li>
        <li><a href="/informations-legales/licences"><strong>Réutiliser les données</strong><span>Licence et mention de la source →</span></a></li>
      </ul>
    </>
  );
}
