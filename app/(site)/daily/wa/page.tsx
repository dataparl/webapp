import type { Metadata } from "next";
import Inscription from "./Inscription";

export const metadata: Metadata = {
  title: "Le DataParl' Daily sur WhatsApp",
  description: "Chaque matin, le récapitulatif de tous les mouvements de collaborateurs parlementaires, directement dans WhatsApp.",
  alternates: { canonical: "/daily/wa" },
};

type Props = { searchParams: Promise<{ desinscription?: string }> };

export default async function ChaineWhatsApp({ searchParams }: Props) {
  const { desinscription } = await searchParams;
  return (
    <>
      <h1>Le DataParl&apos; Daily sur <span className="surligne">WhatsApp</span></h1>
      <p className="lead">
        Chaque matin, le récapitulatif de tous les arrivées, départs et transferts de collaborateurs
        parlementaires — Assemblée nationale, Sénat, Parlement européen — envoyé depuis notre numéro
        WhatsApp officiel. Laisse ton numéro :
      </p>
      <Inscription jetonDesinscription={desinscription} />
      <p className="meta">
        Ton numéro sert uniquement à recevoir le Daily ; désinscription à tout moment en un clic.
        Version Telegram : <a href="/daily/tm">DataParl&apos; Daily sur Telegram</a>.
      </p>
    </>
  );
}
