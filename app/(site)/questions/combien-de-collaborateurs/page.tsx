import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Combien de collaborateurs a un député ou un sénateur ?",
  description: "Effectifs des équipes parlementaires : combien de collaborateurs par député, sénateur, moyennes et plafonds.",
  alternates: { canonical: "/questions/combien-de-collaborateurs" },
};
export const revalidate = 3600;

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [{
      "@type": "Question",
      name: "Combien de collaborateurs a un député ou un sénateur ?",
      acceptedAnswer: { "@type": "Answer", text: "Chaque parlementaire français dispose d’une enveloppe qui lui permet de recruter en général entre un et cinq collaborateurs, répartis entre l’Assemblée ou le Sénat et sa circonscription. Les effectifs exacts varient fortement d’un élu à l’autre et sont suivis en continu par DataParl’, à partir des listes officielles." },
    }],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="meta"><a href="/questions">&larr; Toutes les questions</a></p>
      <h1>Combien de collaborateurs a un député ou un sénateur ?</h1>
      <p className="lead">Chaque parlementaire français dispose d’une enveloppe qui lui permet de recruter en général entre un et cinq collaborateurs, répartis entre l’Assemblée ou le Sénat et sa circonscription. Les effectifs exacts varient fortement d’un élu à l’autre et sont suivis en continu par DataParl’, à partir des listes officielles.</p>
      <h2>Les plafonds</h2>\n      <p>Les crédits collaborateurs sont déconcentrés : chaque élu choisit comment répartir son enveloppe entre ses employés. Les équipes vont donc d’un seul collaborateur à des équipes étoffées pour les présidents de groupe ou les questeurs.</p>\n      <h2>Voir les équipes réelles</h2>\n      <p>La composition exacte de chaque équipe, avec les fonctions, est publiée et mise à jour : <a href="https://www.dataparl.fr/parlementaires">fiches parlementaires de DataParl’</a>.</p>
      <p className="meta">Source : listes officielles des collaborateurs publiées par l'Assemblée nationale et le Sénat, suivies par <a href="https://www.dataparl.fr">DataParl'</a>.</p>
    </>
  );
}
