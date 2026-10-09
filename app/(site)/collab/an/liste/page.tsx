import type { Metadata } from "next";
import ListeChambre from "../../ListeChambre";

export const revalidate = 3600;
type Props = { searchParams: Promise<{ page?: string }> };

export const metadata: Metadata = {
  title: "Liste des collaborateurs de l'Assemblée nationale — complète",
  description: "La liste référence de tous les collaborateurs parlementaires en poste à l'Assemblée nationale, avec l'élu employeur et la fonction.",
  alternates: { canonical: "/collab/an/liste" },
};

export default async function Page({ searchParams }: Props) {
  const page = Math.max(1, parseInt((await searchParams).page ?? "1", 10) || 1);
  return <ListeChambre chambre="assemblee" page={page} />;
}
