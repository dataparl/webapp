import type { Metadata } from "next";
import HubChambre from "../HubChambre";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Liste des collaborateurs de l'Assemblée nationale",
  description: "La liste des collaborateurs parlementaires de l'Assemblée nationale : la liste complète en poste avec l'élu employeur, les fiches par parti et par groupe, la recherche des équipes et les mouvements.",
  alternates: { canonical: "/collab/an" },
};

export default function Page() {
  return <HubChambre chambre="assemblee" />;
}
