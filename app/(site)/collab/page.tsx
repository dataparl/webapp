import type { Metadata } from "next";
import RechercheGlobale from "@/app/_components/RechercheGlobale";
import Equipes from "./Equipes";

export const metadata: Metadata = { title: "Collaborateurs" };

export default function Collabs() {
  return (
    <>
      <h1>Les <span className="surligne">collaborateurs</span></h1>
      <p className="lead">Qui travaille pour quel élu, aujourd&apos;hui et depuis 2015. Retrouve la fiche d&apos;une personne, ou cherche par élu, groupe ou chambre et exporte une équipe en un clic.</p>
      <RechercheGlobale placeholder="Nom d'un collaborateur ou d'un élu" />
      <h2>Les équipes</h2>
      <Equipes />
    </>
  );
}
