import type { Metadata } from "next";
import TrombinoChambre from "../../TrombinoChambre";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Trombinoscope des collaborateurs de Sénateur",
  description: "Trombinoscope des collaborateurs de Sénateur : la planche complète des collaborateurs parlementaires en poste au Sénat, avec le nom de chacun, le sénateur employeur et la fonction — mise à jour quotidienne.",
  alternates: { canonical: "/collab/senat/trombinoscope" },
};

export default function Page() {
  return <TrombinoChambre chambre="senat" />;
}
