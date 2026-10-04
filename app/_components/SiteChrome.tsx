import LogoSite from "./LogoSite";
import BarreRechercheHeader from "./BarreRechercheHeader";

export const API_URL = "https://api.dataparl.fr";

// Liens clés : desktop dans l'en-tête, mobile dans le menu déroulant.
const NAV = [
  { href: "/mouvements", label: "Mouvements" },
  { href: "/collab", label: "Collaborateurs" },
  { href: "/parlementaires", label: "Parlementaires" },
  { href: "/vigiparl", label: "VigiParl'" },
  { href: "/mixiparl", label: "MixiParl'" },
  { href: "/alertes", label: "Alertes" },
];

export function EnTeteSite() {
  const liens = [...NAV, { href: "/mon-compte", label: "Mon compte" }];
  return (
    <header className="site">
      <div className="wrap">
        <LogoSite />
        <nav className="nav-principal" aria-label="Navigation principale">
          {liens.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
        {/* Recherche élus / collaborateurs, présente sur presque toutes les pages. */}
        <BarreRechercheHeader />
        {/* Menu mobile : déroulant natif, sans JavaScript, en haut à gauche. */}
        <details className="menu-mobile">
          <summary aria-label="Ouvrir le menu de navigation">☰</summary>
          <nav aria-label="Navigation principale mobile">
            {liens.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}

export function PiedDePage() {
  return (
    <footer className="site">
      <div className="wrap pied-une-ligne">
        <span className="meta">© 2026 DataParl&apos; : le Parlement, pièce par pièce.</span>
        <nav aria-label="Plan du site">
          <a href="/methode">Méthode</a>
          <a href="/a-propos">À propos</a>
          <a href="/sitemap">Plan du site</a>
          <a href="/informations-legales">Informations légales</a>
        </nav>
      </div>
    </footer>
  );
}
