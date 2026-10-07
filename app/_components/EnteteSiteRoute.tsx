"use client";
import { usePathname } from "next/navigation";
import { EnTeteSite } from "./SiteChrome";
import EnTeteJobs from "../(site)/jobs/_components/EnTeteJobs";

// En-tête du site www : l'en-tête Jobs (logo + menu du module) remplace
// l'en-tête standard sur les pages DataParl' Jobs et le sous-domaine
// jobs.dataparl.fr (les réécritures du proxy gardent le chemin /jobs/…).

export default function EnteteSiteRoute() {
  const chemin = usePathname() ?? "";
  const jobs = chemin === "/jobs" || chemin.startsWith("/jobs/");
  return jobs ? <EnTeteJobs /> : <EnTeteSite />;
}
