import type { Metadata } from "next";
import TrombinoChambre from "../../TrombinoChambre";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Trombinoscope des collaborateurs de député européen",
  description: "Trombinoscope des collaborateurs de député européen : la planche complète des collaborateurs des eurodéputés français en poste, avec le nom de chacun, l'élu employeur et la fonction (accrédités, locaux, groupements).",
  alternates: { canonical: "/collab/pe/trombinoscope" },
};

export default function Page() {
  return <TrombinoChambre chambre="europarl" />;
}
