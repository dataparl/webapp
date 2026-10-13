import type { Metadata } from "next";
import { dateLongue } from "@/lib/format";
import { mandatsEtCabinets } from "@/lib/gouvernement";
import ExplorateurGouvernement from "./ExplorateurGouvernement";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Gouvernements et cabinets ministériels depuis 2012",
  description: "La composition des gouvernements français depuis mai 2012 et la liste des membres de chaque cabinet ministériel — directeurs, chefs de cabinet, conseillers — d'après les nominations publiées au Journal officiel.",
  alternates: { canonical: "/gouvernement" },
};

const FAQ = [
  {
    q: "Qu'est-ce qu'un cabinet ministériel ?",
    r: "Le cabinet ministériel est l'équipe personnelle d'un ministre : directeur ou directrice de cabinet, chef de cabinet, conseillers et chargés de mission. Il l'assiste dans ses fonctions politiques, contrairement aux collaborateurs parlementaires qui travaillent pour un élu au Parlement.",
  },
  {
    q: "D'où viennent ces données ?",
    r: "Des nominations et cessations de fonctions publiées au Journal officiel (décrets et arrêtés de nomination), extraites du fonds JORF de la DILA et rattachées à chaque ministre en fonction à la date du décret. DataParl' couvre tous les gouvernements depuis mai 2012.",
  },
  {
    q: "Pourquoi certains cabinets sont-ils « non documentés » ?",
    r: "Le Journal officiel publie les nominations au fil de l'eau, souvent avec du retard : pour un gouvernement très récent, un remaniement ou un mandat de quelques jours, aucun décret n'est encore paru. La mention signale donc l'absence de données identifiées dans les sources consultées, pas l'absence de cabinet.",
  },
  {
    q: "Un membre de cabinet peut-il aussi être collaborateur parlementaire ?",
    r: "Oui, c'est fréquent : un même parcours peut passer d'un cabinet de député à un cabinet ministériel. Quand c'est la même personne, DataParl' relie sa fiche unique de collaborateur — l'appartenance aux deux mondes est visible sur la même page.",
  },
];

export default async function Gouvernement() {
  const { mandats, cabinets } = await mandatsEtCabinets();
  const personnes = new Set(cabinets.map((c) => c.collab_cle)).size;
  const derniere = cabinets.reduce((acc, c) => (c.debut > acc ? c.debut : acc), "0000-00-00");

  return (
    <>
      <h1>Les <span className="surligne">gouvernements</span> et leurs cabinets</h1>
      <p className="lead">Qui gouverne, et qui travaille pour qui : la composition des gouvernements français depuis mai 2012, avec pour chaque ministre la liste des membres de son cabinet — directeurs, chefs de cabinet, conseillers — telle que publiée au Journal officiel.</p>
      <p className="meta">
        {mandats.length} mandats ministériels · {personnes} personnes répertoriées en cabinet · dernière nomination identifiée : {dateLongue(derniere)} · source : Journal officiel (DILA).
      </p>

      <ExplorateurGouvernement mandats={mandats} cabinets={cabinets} />

      <h2 id="faq">Questions fréquentes</h2>
      <dl>
        {FAQ.map((f) => (
          <div key={f.q}>
            <dt><strong>{f.q}</strong></dt>
            <dd>{f.r}</dd>
          </div>
        ))}
      </dl>
      <p className="meta">À voir aussi : <a href="/collab">la liste des collaborateurs parlementaires</a> — les mêmes personnes apparaissent parfois dans les deux, avec une fiche unique.</p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Dataset",
                name: "Gouvernements et cabinets ministériels français",
                description: "Composition des gouvernements français depuis mai 2012 et membres des cabinets ministériels (directeurs, chefs de cabinet, conseillers), d'après les nominations publiées au Journal officiel.",
                url: "https://www.dataparl.fr/gouvernement",
                creator: { "@type": "Organization", name: "DataParl'", url: "https://www.dataparl.fr" },
                isAccessibleForFree: true,
              },
              {
                "@type": "FAQPage",
                mainEntity: FAQ.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.r },
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.dataparl.fr/" },
                  { "@type": "ListItem", position: 2, name: "Gouvernements", item: "https://www.dataparl.fr/gouvernement" },
                ],
              },
            ],
          }),
        }}
      />
    </>
  );
}
