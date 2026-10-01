import Logo from "./Logo";

export const API_URL = "https://api.dataparl.fr";

export function EnTeteSite() {
  return (
    <header className="site">
      <div className="wrap">
        <Logo />
        <nav aria-label="Navigation principale">
          <a href="/alertes">Alertes</a>
          <a href="/mon-compte">Mon compte</a>
        </nav>
      </div>
    </header>
  );
}

export function PiedDePage() {
  return (
    <footer className="site">
      <div className="wrap pied">
        <span>© 2026 DataParl&apos; : le Parlement, pièce par pièce.</span>
        <nav aria-label="Liens de pied de page">
          <a href="https://www.dataparl.fr/presse">Presse</a>
          <a href="https://www.dataparl.fr/informations-legales">Informations légales</a>
          <a href={API_URL}>API</a>
        </nav>
      </div>
    </footer>
  );
}
