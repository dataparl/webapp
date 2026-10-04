import LogoSite from "./LogoSite";

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
        {/* Menu mobile : déroulant natif, sans JavaScript. */}
        <details className="menu-mobile">
          <summary aria-label="Ouvrir le menu de navigation">Menu</summary>
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
      <div className="wrap">
        <nav className="pied-nav" aria-label="Plan du site">
          <a href="/mouvements">Mouvements</a>
          <a href="/collab">Collaborateurs</a>
          <a href="/parlementaires">Parlementaires</a>
          <a href="/groupe">Groupes</a>
          <a href="/departement">Départements</a>
          <a href="/senatoriales2026">Sénatoriales 2026</a>
          <a href="/vigiparl">VigiParl&apos;</a>
          <a href="/mixiparl">MixiParl&apos;</a>
          <a href="/alertes">Alertes</a>
          <a href="/methode">Méthode</a>
          <a href={API_URL}>API</a>
          <a href="/a-propos">À propos</a>
          <a href="/presse">Presse</a>
          <a href="/informations-legales">Informations légales</a>
        </nav>
        <span className="meta">© 2026 DataParl&apos; : le Parlement, pièce par pièce.</span>
      </div>
    </footer>
  );
}
