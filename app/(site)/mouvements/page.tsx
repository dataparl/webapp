import type { Metadata } from "next";
import ListeMouvements from "@/app/_components/ListeMouvements";
import { derniersMouvements, type Mouvement } from "@/lib/data";
import Onglets from "./Onglets";
import Recherche from "./Recherche";

export const revalidate = 900;
export const metadata: Metadata = { title: "Mouvements", alternates: { canonical: "/mouvements" } };

export default async function Mouvements() {
  // Aperçu libre : les 15 derniers mouvements, sans compte. La recherche
  // complète (filtres, historique depuis 2015) reste réservée aux comptes.
  const apercu: Mouvement[] = await derniersMouvements(15).catch(() => []);
  return (
    <>
      <h1>Les <span className="surligne">mouvements</span></h1>
      <p className="lead">Arrivées, départs et transferts de collaborateurs parlementaires, depuis 2015.</p>
      <Onglets actif="parlement" />
      {apercu.length > 0 && (
        <>
          <div className="apercu-libre">
            <h2 style={{ margin: "0 0 8px" }}>Les 15 derniers mouvements</h2>
          </div>
          <ListeMouvements mouvements={apercu} />
        </>
      )}
      <Recherche />
    </>
  );
}
