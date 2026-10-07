"use client";

// En-tête de jobs.dataparl.fr : logo DataParl' Jobs (comme DataParl' API sur
// api.dataparl.fr) + navigation propre au module. Les liens vers le site www
// et l'API sont absolus : ce sont d'autres sous-domaines.

export default function EnTeteJobs() {
  const liens = [
    { href: "/old-jobs", label: "Anciennes offres" },
    { href: "https://www.dataparl.fr/", label: "DataParl'" },
    { href: "https://api.dataparl.fr/", label: "DataParl' API" },
    { href: "https://www.dataparl.fr/a-propos", label: "À propos" },
    { href: "https://www.dataparl.fr/mon-compte", label: "Mon compte" },
  ];
  return (
    <header className="site">
      <div className="wrap">
        <a className="logo" href="/" aria-label="DataParl' Jobs, accueil">
          Data<span className="surligne">Parl&apos;</span> <span style={{ color: "var(--bleu)" }}>Jobs</span>
        </a>
        <nav className="nav-principal" aria-label="Navigation DataParl' Jobs">
          {liens.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
        {/* Menu mobile : déroulant natif. */}
        <details className="menu-mobile">
          <summary aria-label="Ouvrir le menu de navigation">☰</summary>
          <nav aria-label="Navigation DataParl' Jobs mobile">
            {liens.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
