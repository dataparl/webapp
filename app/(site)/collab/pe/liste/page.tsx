import type { Metadata } from "next";
import ListeChambre from "../../ListeChambre";

export const revalidate = 3600;
type Props = { searchParams: Promise<{ page?: string }> };

export const metadata: Metadata = {
  title: "Liste des collaborateurs du Parlement européen — complète",
  description: "La liste référence de tous les collaborateurs parlementaires en poste au Parlement européen, avec l'élu employeur et la fonction.",
  alternates: { canonical: "/collab/pe/liste" },
};

export default async function Page({ searchParams }: Props) {
  const page = Math.max(1, parseInt((await searchParams).page ?? "1", 10) || 1);
  return <ListeChambre chambre="europarl" page={page} />;
}
