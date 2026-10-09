import type { Metadata } from "next";
import HubChambre from "../HubChambre";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Liste des collaborateurs du Sénat",
  description: "La liste des collaborateurs parlementaires du Sénat : la liste complète en poste avec l'élu employeur, les fiches par parti et par groupe, la recherche des équipes et les mouvements.",
  alternates: { canonical: "/collab/senat" },
};

export default function Page() {
  return <HubChambre chambre="senat" />;
}
