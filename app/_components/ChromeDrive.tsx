import Link from "next/link";

// Chrome commun de drive.dataparl.fr (tableur DataParl' Sheets et recherche) :
// un en-tête et un pied propres au domaine, les liens pointant vers www.

export function EnTeteDrive() {
  return (
    <header className="site">
      <div className="wrap">
        <a className="logo" href="/sheets">Data<span className="surligne">Parl&apos;</span> Sheets</a>
        <nav aria-label="Navigation DataParl' Sheets">
          <a href="https://www.dataparl.fr/">DataParl&apos;</a>
          <a href="/search">Recherche Base de Données</a>
        </nav>
      </div>
    </header>
  );
}

export function PiedDrive() {
  return (
    <footer className="site">
      <div className="wrap pied">
        <span>© 2026 DataParl&apos; Sheets</span>
        <nav aria-label="Liens de pied de page">
          <a href="https://www.dataparl.fr/">DataParl&apos;</a>
          <Link href="/informations-legales">Informations légales</Link>
          <a href="https://www.dataparl.fr/informations-legales/cgu-dataparl-sheets">CGU DataParl&apos; Sheets</a>
        </nav>
      </div>
    </footer>
  );
}
