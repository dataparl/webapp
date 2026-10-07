"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Pied de page du site www : sur DataParl' Jobs (pages /jobs et sous-domaine
// jobs.dataparl.fr), le footer Jobs remplace le footer standard.
// Le middleware réécrit les URLs du sous-domaine, donc on complète le test du
// chemin par le nom d'hôte après hydratation.

export default function PiedDePageRoute() {
  const chemin = usePathname();
  const [jobs, setJobs] = useState(!!chemin && (chemin === "/jobs" || chemin.startsWith("/jobs/")));

  useEffect(() => {
    if (window.location.hostname === "jobs.dataparl.fr") setJobs(true);
  }, []);

  return (
    <footer className="site">
      <div className="wrap pied-une-ligne">
        {jobs ? (
          <>
            <span className="meta">© 2026 DataParl&apos; Jobs : le Parlement t&apos;attend.</span>
            <nav aria-label="Plan du site DataParl' Jobs">
              <Link href="/sitemap">Plan du site</Link>
              <Link href="/informations-legales">Informations légales</Link>
              <Link href="/informations-legales/cgu-jobs">CGU DataParl&apos; Jobs</Link>
            </nav>
          </>
        ) : (
          <>
            <span className="meta">© 2026 DataParl&apos; : le Parlement, pièce par pièce.</span>
            <nav aria-label="Plan du site">
              <a href="/methode">Méthode</a>
              <a href="/a-propos">À propos</a>
              <a href="/sitemap">Plan du site</a>
              <a href="/informations-legales">Informations légales</a>
            </nav>
          </>
        )}
      </div>
    </footer>
  );
}
