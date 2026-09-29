import type { Metadata } from "next";
import Equipes from "./Equipes";

export const metadata: Metadata = { title: "Collaborateurs" };

export default function Collabs() {
  return (
    <>
      <h1>Les <span className="surligne">collaborateurs</span></h1>
      <p className="lead">Qui travaille pour quel élu, aujourd&apos;hui. Recherche par élu, groupe, chambre ou nom, et export d&apos;une équipe en un clic.</p>
      <Equipes />
    </>
  );
}
