import type { Metadata } from "next";
import { TELEGRAM_CHANNEL } from "@/lib/env";

export const metadata: Metadata = {
  title: "Le DataParl' Daily sur Telegram",
  description: "Chaque matin, le récapitulatif de tous les mouvements de collaborateurs parlementaires, directement dans Telegram.",
  alternates: { canonical: "/daily/tm" },
};

export default function ChaineTelegram() {
  return (
    <>
      <h1>Le DataParl&apos; Daily sur <span className="surligne">Telegram</span></h1>
      <p className="lead">
        Chaque matin, le récapitulatif de tous les arrivées, départs et transferts de collaborateurs
        parlementaires — Assemblée nationale, Sénat, Parlement européen — publié dans notre canal
        Telegram. Rejoins-le en un clic :
      </p>
      <p><a href={`https://t.me/${TELEGRAM_CHANNEL}`}><strong>Rejoindre le canal @{TELEGRAM_CHANNEL}</strong></a></p>
      <p className="meta">
        Aucun compte requis, tu peux quitter le canal quand tu veux.
        Version WhatsApp : <a href="/daily/wa">DataParl&apos; Daily sur WhatsApp</a>.
      </p>
    </>
  );
}
