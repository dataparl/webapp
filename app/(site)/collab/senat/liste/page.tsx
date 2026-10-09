import type { Metadata } from "next";
import ListeChambre from "../../ListeChambre";

export const revalidate = 3600;
type Props = { searchParams: Promise<{ page?: string }> };

export const metadata: Metadata = {
  title: "Liste des collaborateurs par sénateur — complète",
  description: "La liste référence de tous les collaborateurs parlementaires en poste au Sénat : nom du collaborateur, sénateur employeur et fonction, mise à jour quotidiennement.",
  alternates: { canonical: "/collab/senat/liste" },
};

export default async function Page({ searchParams }: Props) {
  const page = Math.max(1, parseInt((await searchParams).page ?? "1", 10) || 1);
  return <ListeChambre chambre="senat" page={page} />;
}
