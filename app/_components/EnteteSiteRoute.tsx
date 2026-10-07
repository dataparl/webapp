"use client";
import { usePathname } from "next/navigation";
import { EnTeteSite } from "./SiteChrome";
import EnTeteJobs from "../(site)/jobs/_components/EnTeteJobs";

// En-tête du site www : l'en-tête Jobs (logo + menu du module) remplace
// l'en-tête standard sur DataParl' Jobs. La réécriture du proxy étant
// transparente (usePathname voit l'URL publique), l'hôte est détecté côté
// serveur par le layout et passé ici en prop ; le chemin /jobs/… sert de
// repli pour les environnements de test.

export default function EnteteSiteRoute({ hoteJobs }: { hoteJobs: boolean }) {
  const chemin = usePathname() ?? "";
  const jobs = hoteJobs || chemin === "/jobs" || chemin.startsWith("/jobs/");
  return jobs ? <EnTeteJobs /> : <EnTeteSite />;
}
