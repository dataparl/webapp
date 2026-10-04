import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DataParl' Sheets",
  description: "Le tableur de DataParl' : les données du Parlement, feuille par feuille, lues en direct sur l'API. Logiciel libre, données ODbL.",
};

export default function SheetsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page sheets">
      <header className="site">
        <div className="wrap">
          <a className="logo" href="/sheets">Data<span className="surligne">Sheets</span></a>
          <nav aria-label="Navigation DataParl' Sheets">
            <a href="/">DataParl&apos;</a>
            <a href="/methode">Méthode</a>
          </nav>
        </div>
      </header>
      <main><div className="wrap large">{children}</div></main>
      <footer className="site">
        <div className="wrap pied">
          <span>© 2026 DataParl&apos; Sheets — logiciel libre (MIT), données sous licence ODbL.</span>
          <nav aria-label="Liens de pied de page">
            <a href="/informations-legales">Informations légales</a>
            <a href="/methode">Méthode</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
