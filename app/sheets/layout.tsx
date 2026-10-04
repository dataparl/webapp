import type { Metadata } from "next";
import { EnTeteDrive, PiedDrive } from "@/app/_components/ChromeDrive";
import RetourHaut from "@/app/_components/RetourHaut";

export const metadata: Metadata = {
  title: "DataParl' Sheets",
  description:
    "Le tableur de DataParl' : les données du Parlement, feuille par feuille, lues en direct sur l'API. Connexion requise, accès gratuit.",
};

export default function SheetsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page sheets">
      <EnTeteDrive />
      <main><div className="wrap large">{children}</div></main>
      <PiedDrive />
      <RetourHaut />
    </div>
  );
}
