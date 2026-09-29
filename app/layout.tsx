import type { Metadata } from "next";
import BandeauCookies from "./_components/BandeauCookies";
import Logo from "./_components/Logo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cavaparlement.eu"),
  title: { default: "DataParl' : le Parlement, pièce par pièce", template: "%s | DataParl'" },
  description:
    "Arrivées, départs et transferts des collaborateurs des députés, sénateurs et eurodéputés, d'après les publications officielles. Gratuit, sans pub, sans pistage.",
  applicationName: "DataParl'",
  openGraph: { siteName: "DataParl'", locale: "fr_FR", type: "website" },
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
            <Logo />
            <nav aria-label="Navigation principale">
              <a href="/alertes">Alertes</a>
              <a href="/api">API</a>
              <a href="/mon-compte">Mon compte</a>
            </nav>
          </div>
        </header>
        <main><div className="wrap">{children}</div></main>
        <footer className="site">
          <div className="wrap">
            <div>
              DataParl&apos; : le Parlement, pièce par pièce. Données officielles de l&apos;Assemblée nationale et du Sénat
              (Licence Ouverte), historique Regards Citoyens (ODbL). Gratuit, sans pub, sans pistage, indépendant.
            </div>
            <nav aria-label="Liens de pied de page">
              <a href="/informations-legales">Informations légales</a>
              <a href="/informations-legales/confidentialite">Données personnelles</a>
              <a href="/informations-legales/cookies">Cookies</a>
              <a href="/informations-legales/licences">Licences</a>
              <a href="https://github.com/dataparl">Code et données sur GitHub</a>
            </nav>
          </div>
        </footer>
        <BandeauCookies />
      </body>
    </html>
  );
}
