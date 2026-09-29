import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Onglets from "../Onglets";
import Recherche from "../Recherche";

const PAGES = {
  parlement: { titre: "Les trois chambres", chambre: undefined },
  assemblee: { titre: "Assemblée nationale", chambre: "assemblee" },
  senat: { titre: "Sénat", chambre: "senat" },
  europarl: { titre: "Parlement européen", chambre: "europarl" },
} as const;

type Slug = keyof typeof PAGES;

export function generateStaticParams() {
  return Object.keys(PAGES).map((chambre) => ({ chambre }));
}

export async function generateMetadata({ params }: { params: Promise<{ chambre: string }> }): Promise<Metadata> {
  const { chambre } = await params;
  const page = PAGES[chambre as Slug];
  return { title: page ? `Mouvements : ${page.titre}` : "Mouvements" };
}

export default async function MouvementsChambre({ params }: { params: Promise<{ chambre: string }> }) {
  const { chambre } = await params;
  const page = PAGES[chambre as Slug];
  if (!page) notFound();
  return (
    <>
      <h1>Mouvements : <span className="surligne">{page.titre}</span></h1>
      {chambre === "europarl" && (
        <p className="meta">Le suivi quotidien du Parlement européen est en pause : son site bloque actuellement les robots.</p>
      )}
      <Onglets actif={chambre} />
      <Recherche chambre={page.chambre} />
    </>
  );
}
