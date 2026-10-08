import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qui sont les collaborateurs parlementaires ?",
  description: "Définition, statut et rôle des collaborateurs des députés et sénateurs : qui sont ces employés qui composent les cabinets parlementaires français.",
  alternates: { canonical: "/questions/qui-sont-les-collaborateurs-parlementaires" },
};
export const revalidate = 3600;

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [{
      "@type": "Question",
      name: "Qui sont les collaborateurs parlementaires ?",
      acceptedAnswer: { "@type": "Answer", text: "Les collaborateurs parlementaires sont les personnes employées par chaque député ou sénateur français pour l’aider dans son travail : suivi des dossiers, rédaction, relations avec les électeurs et les administrations. Ils figurent sur des listes officielles publiées par l’Assemblée nationale et le Sénat, que DataParl’ recense et met à jour quotidiennement." },
    }],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="meta"><a href="/questions">&larr; Toutes les questions</a></p>
      <h1>Qui sont les collaborateurs parlementaires ?</h1>
      <p className="lead">Les collaborateurs parlementaires sont les personnes employées par chaque député ou sénateur français pour l’aider dans son travail : suivi des dossiers, rédaction, relations avec les électeurs et les administrations. Ils figurent sur des listes officielles publiées par l’Assemblée nationale et le Sénat, que DataParl’ recense et met à jour quotidiennement.</p>
      <h2>Un statut propre</h2>\n      <p>Recrutés par contrat de droit privé par chaque parlementaire, ils sont payés sur une enveloppe publique (crédit de téléphone et frais de représentation, transformé en crédit collaborateurs). La loi encadre leurs fonctions et leur statut.</p>\n      <h2>Combien sont-ils ?</h2>\n      <p>Chaque parlementaire peut recruter plusieurs collaborateurs, répartis entre Paris et la circonscription. Au total, plusieurs milliers de personnes travaillent comme collaborateurs parlementaires en France. Le nombre exact, chambre par chambre, évolue chaque mois : <a href="https://www.dataparl.fr/mouvements">voir les mouvements récents</a>.</p>\n      <h2>Où les trouver ?</h2>\n      <p>Les listes complètes sont publiques : <a href="https://www.dataparl.fr/collab">recherchez un collaborateur ou une équipe sur DataParl’</a>.</p>
      <p className="meta">Source : listes officielles des collaborateurs publièes par l'Assemblée nationale et le Sénat, suivies par <a href="https://www.dataparl.fr">DataParl'</a>.</p>
    </>
  );
}
