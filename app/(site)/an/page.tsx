import type { Metadata } from "next";
import LandingChambre from "../LandingChambre";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Assemblée nationale",
  description: "Tout DataParl' sur l'Assemblée nationale : mouvements des collaborateurs, députés, groupes, renouvellement et mixité des équipes.",
  alternates: { canonical: "/an" },
};

export default function Page() {
  return <LandingChambre chambre="assemblee" />;
}
