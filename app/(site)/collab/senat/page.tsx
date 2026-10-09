import type { Metadata } from "next";
import HubChambre from "../HubChambre";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Collaborateurs · Sénat",
  description: "Les collaborateurs parlementaires Sénat : la liste complète en poste, les fiches par parti et par groupe, la recherche des équipes et le réseau.",
  alternates: { canonical: "/collab/senat" },
};

export default function Page() {
  return <HubChambre chambre="senat" />;
}
