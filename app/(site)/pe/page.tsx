import type { Metadata } from "next";
import LandingChambre from "../LandingChambre";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Parlement européen",
  description: "Tout DataParl' sur le Parlement européen : mouvements des collaborateurs, eurodéputés, groupes, tiers payants, renouvellement et mixité des équipes.",
  alternates: { canonical: "/pe" },
};

export default function Page() {
  return <LandingChambre chambre="europarl" />;
}
