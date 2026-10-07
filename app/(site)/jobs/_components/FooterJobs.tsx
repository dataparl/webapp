"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Pied de page du site www : sur les pages DataParl' Jobs, le footer Jobs
// remplace le footer standard (un seul footer, jamais deux empilés).

export default function PiedDePageRoute() {
  const chemin = usePathname();
  const jobs = !!chemin && (chemin === "/jobs" || chemin.startsWith("/jobs/"));

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
