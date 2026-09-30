import Logo from "./_components/Logo";

// Urne vide : dessin original, trait marine, fente sur le dessus.
function UrneVide() {
  return (
    <svg viewBox="0 0 200 180" width="200" height="180" role="img" aria-label="Une urne vide">
      <ellipse cx="100" cy="166" rx="74" ry="7" fill="currentColor" opacity=".08" />
      <path d="M40 58 L160 58 L150 160 L50 160 Z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      <path d="M32 44 L168 44 L160 58 L40 58 Z" fill="var(--jaune)" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      <rect x="80" y="48" width="40" height="5" rx="2.5" fill="currentColor" />
      <path d="M58 70 L64 150 M142 70 L136 150" stroke="currentColor" strokeWidth="3" opacity=".25" strokeLinecap="round" />
      <text x="100" y="118" textAnchor="middle" fontFamily="Spectral, Georgia, serif" fontWeight="700" fontSize="30" fill="currentColor">0</text>
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="page">
      <header className="site"><div className="wrap"><Logo /></div></header>
      <main>
        <div className="wrap" style={{ textAlign: "center", paddingTop: 24 }}>
          <div style={{ color: "var(--ink)" }}><UrneVide /></div>
          <h1><span className="surligne">Motion rejetée.</span></h1>
          <p className="lead" style={{ margin: "0 auto" }}>Cette page n&apos;existe pas (ou plus). Pas grave, l&apos;hémicycle t&apos;attend.</p>
          <a className="btn" href="https://www.dataparl.fr/">Retour à l&apos;accueil</a>
        </div>
      </main>
    </div>
  );
}
