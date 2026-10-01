import type { Metadata } from "next";
import BandeauCookies from "./_components/BandeauCookies";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dataparl.fr"),
  title: { default: "DataParl' : le Parlement, pièce par pièce", template: "%s | DataParl'" },
  description:
    "Arrivées, départs et transferts des collaborateurs des députés, sénateurs et eurodéputés, d'après les publications officielles. Gratuit, sans pub, sans pistage.",
  applicationName: "DataParl'",
  openGraph: { siteName: "DataParl'", locale: "fr_FR", type: "website" },
  // Cartes de partage (X, LinkedIn, Bluesky, Facebook, messageries) : grande image par défaut.
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  formatDetection: { telephone: false },
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
        {children}
        <BandeauCookies />
      </body>
    </html>
  );
}
