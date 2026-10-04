import type { Metadata } from "next";
import ListeMouvements from "@/app/_components/ListeMouvements";
import { notFound } from "next/navigation";
import { derniersMouvements, type Mouvement } from "@/lib/data";
import Onglets from "../Onglets";
import Recherche from "../Recherche";

export const revalidate = 900;

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
  return { title: page ? `Mouvements : ${page.titre}` : "Mouvements", alternates: { canonical: `/mouvements/${chambre}` } };
}

export default async function MouvementsChambre({ params }: { params: Promise<{ chambre: string }> }) {
  const { chambre } = await params;
  const page = PAGES[chambre as Slug];
  if (!page) notFound();
  // Aperçu libre : les 15 derniers mouvements, sans compte. La recherche
  // complète (filtres, historique depuis 2015) reste réservée aux comptes.
  const apercu: Mouvement[] = await derniersMouvements(15, page.chambre).catch(() => []);
  return (
    <>
      <h1>Mouvements : <span className="surligne">{page.titre}</span></h1>
      {chambre === "europarl" && (
        <p className="meta">Le suivi quotidien du Parlement européen est en pause : son site bloque actuellement les robots.</p>
      )}
      <Onglets actif={chambre} />
      {apercu.length > 0 && (
        <>
          <div className="apercu-libre">
            <h2 style={{ margin: "0 0 8px" }}>Les 15 derniers mouvements</h2>
          </div>
          <ListeMouvements mouvements={apercu} />
        </>
      )}
      <Recherche chambre={page.chambre} />
    </>
  );
}
