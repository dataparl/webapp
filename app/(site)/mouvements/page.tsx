import type { Metadata } from "next";
import Onglets from "./Onglets";
import Recherche from "./Recherche";

export const metadata: Metadata = { title: "Mouvements", alternates: { canonical: "/mouvements" } };

export default function Mouvements() {
  return (
    <>
      <h1>Les <span className="surligne">mouvements</span></h1>
      <p className="lead">Arrivées, départs et transferts de collaborateurs parlementaires, depuis 2015.</p>
      <Onglets actif="parlement" />
      <Recherche />
    </>
  );
}
