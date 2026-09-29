import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cavaparlement.eu"),
  title: { default: "CavaParlement : les mouvements des collaborateurs parlementaires", template: "%s | CavaParlement" },
  description:
    "Arrivées, départs et transferts des collaborateurs des députés, sénateurs et eurodéputés, d'après les publications officielles.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Spectral:wght@600;700&display=swap"
        />
      </head>
      <body>
        <header className="site">
          <div className="wrap">
            <a className="logo" href="/">CavaParlement</a>
            <nav>
              <a href="/alertes">Alertes</a>
              <a href="https://api.cavaparlement.eu">API</a>
            </nav>
          </div>
        </header>
        <main><div className="wrap">{children}</div></main>
        <footer className="site">
          <div className="wrap">
            Données : Assemblée nationale et Sénat (Licence Ouverte), historique Regards Citoyens (ODbL).
            Code et données : <a href="https://github.com/dataparl">github.com/dataparl</a>.
          </div>
        </footer>
      </body>
    </html>
  );
}
