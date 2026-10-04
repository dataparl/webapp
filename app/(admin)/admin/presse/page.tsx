"use client";
import { lien } from "@/app/_components/admin/liens";

export default function Presse() {
  return (
    <>
      <h1>Presse</h1>
      <ul className="sommaire">
        <li><a href={lien("admin", "/presse/pressrelease")}><strong>Communiqués de presse</strong><span>Rédiger, publier, envoyer aux journalistes, suivre les ouvertures →</span></a></li>
        <li><a href={lien("admin", "/presse/presslist")}><strong>Carnet presse</strong><span>Les journalistes : nom, média, email →</span></a></li>
        <li><a href={lien("admin", "/presse/mailing")}><strong>Mailing</strong><span>Écrire aux comptes utilisateurs, en plus des alertes →</span></a></li>
      </ul>
    </>
  );
}
