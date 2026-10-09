import type { Metadata } from "next";
import LandingChambre from "../LandingChambre";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Sénat",
  description: "Tout DataParl' sur le Sénat : mouvements des collaborateurs, sénateurs, groupes, sénatoriales 2026, renouvellement et mixité des équipes.",
  alternates: { canonical: "/senat" },
};

export default function Page() {
  return <LandingChambre chambre="senat" />;
}
