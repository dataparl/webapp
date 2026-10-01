"use client";
import { lien } from "@/app/_components/admin/liens";

export default function Communication() {
  return (
    <>
      <h1>Communication</h1>
      <ul className="sommaire">
        <li><a href={lien("admin", "/communication/pressrelease")}><strong>Communiqués de presse</strong><span>Rédiger, publier, envoyer aux journalistes, suivre les ouvertures →</span></a></li>
        <li><a href={lien("admin", "/communication/presslist")}><strong>Carnet presse</strong><span>Les journalistes : nom, média, email →</span></a></li>
        <li><a href={lien("admin", "/communication/mailing")}><strong>Mailing</strong><span>Écrire aux comptes utilisateurs, en plus des alertes →</span></a></li>
      </ul>
    </>
  );
}
