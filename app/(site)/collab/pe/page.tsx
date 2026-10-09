import type { Metadata } from "next";
import HubChambre from "../HubChambre";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Collaborateurs · Parlement européen",
  description: "Les collaborateurs parlementaires Parlement européen : la liste complète en poste, les fiches par parti et par groupe, la recherche des équipes et le réseau.",
  alternates: { canonical: "/collab/pe" },
};

export default function Page() {
  return <HubChambre chambre="europarl" />;
}
