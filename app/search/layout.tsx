import type { Metadata } from "next";
import { EnTeteDrive, PiedDrive } from "@/app/_components/ChromeDrive";
import RetourHaut from "@/app/_components/RetourHaut";

export const metadata: Metadata = {
  title: "Recherche Base de Données",
  description: "Rechercher dans les bases de données publiées de DataParl' Sheets : renouvellement des équipes, mixité, gouvernements.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page sheets">
      <EnTeteDrive />
      <main><div className="wrap large">{children}</div></main>
      <PiedDrive />
      <RetourHaut />
    </div>
  );
}
