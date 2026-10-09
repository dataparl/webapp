import type { Metadata } from "next";
import HubChambre from "../HubChambre";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Collaborateurs · Assemblée nationale",
  description: "Les collaborateurs parlementaires Assemblée nationale : la liste complète en poste, les fiches par parti et par groupe, la recherche des équipes et le réseau.",
  alternates: { canonical: "/collab/an" },
};

export default function Page() {
  return <HubChambre chambre="assemblee" />;
}
