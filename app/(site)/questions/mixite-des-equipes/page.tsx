import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quelle est la mixité des équipes parlementaires ?",
  description: "Part de femmes parmi les collaborateurs des députés et sénateurs : le taux de mixité par groupe politique et par chambre.",
  alternates: { canonical: "/questions/mixite-des-equipes" },
};
export const revalidate = 3600;

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [{
      "@type": "Question",
      name: "Quelle est la mixité des équipes parlementaires ?",
      acceptedAnswer: { "@type": "Answer", text: "La part de femmes parmi les collaborateurs parlementaires français varie nettement selon les groupes politiques et les chambres. DataParl’ mesure ce taux de mixité pour chaque équipe, chaque groupe et chaque chambre, à partir des listes officielles : c’est le seul suivi public et continu de la mixité des cabinets parlementaires." },
    }],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="meta"><a href="/questions">&larr; Toutes les questions</a></p>
      <h1>Quelle est la mixité des équipes parlementaires ?</h1>
      <p className="lead">La part de femmes parmi les collaborateurs parlementaires français varie nettement selon les groupes politiques et les chambres. DataParl’ mesure ce taux de mixité pour chaque équipe, chaque groupe et chaque chambre, à partir des listes officielles : c’est le seul suivi public et continu de la mixité des cabinets parlementaires.</p>
      <h2>Comment le mesure-t-on ?</h2>\n      <p>Taux de mixité = 1 − |2 × part de femmes − 1|, calculé par équipe puis moyenné. Le genre est déduit de la civilité publiée (Sénat) ou du prénom (Assemblée). <a href="https://www.dataparl.fr/mixiparl/methode">Méthode complète</a>.</p>\n      <h2>Les chiffres par groupe</h2>\n      <p>Le classement complet des groupes et des élus, mis à jour en continu : <a href="https://www.dataparl.fr/mixiparl">MixiParl’</a>.</p>
      <p className="meta">Source : listes officielles des collaborateurs publiées par l'Assemblée nationale et le Sénat, suivies par <a href="https://www.dataparl.fr">DataParl'</a>.</p>
    </>
  );
}
