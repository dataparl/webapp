import type { Metadata } from "next";
import TrombinoChambre from "../../TrombinoChambre";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Trombinoscope des collaborateurs de député",
  description: "Trombinoscope des collaborateurs de député : la planche complète des collaborateurs parlementaires des députés en poste à l'Assemblée nationale, avec le nom de chacun, le député employeur et la fonction.",
  alternates: { canonical: "/collab/an/trombinoscope" },
};

export default function Page() {
  return <TrombinoChambre chambre="assemblee" />;
}
