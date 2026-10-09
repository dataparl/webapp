import type { Metadata } from "next";
import { DM_Sans, Spectral } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import BandeauCookies from "./_components/BandeauCookies";
import "./globals.css";

// Polices auto-hébergées par next/font : préchargées, avec une police de
// repli aux métriques ajustées — le texte n'est jamais reflowé au chargement
// (fin du décalage de mise en page mesuré par Lighthouse, CLS 0,27).
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-dm-sans", display: "swap" });
const spectral = Spectral({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-spectral", display: "swap" });

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
  // Favicons : ICO (32), SVG vectoriel, et icône tactile iOS 180 (app/apple-icon.tsx).
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  // Application web sur l'écran d'accueil iOS : titre affiché sous l'icône.
  appleWebApp: { capable: true, statusBarStyle: "default", title: "DataParl'" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (

    <html lang="fr" className={`${dmSans.variable} ${spectral.variable}`}>
      <head>
        {/* Consent Mode v2 (Google) : tout refusé par défaut, AVANT tout script
            publicitaire. Le bandeau du site actualise ensuite ces signaux selon
            le choix du visiteur (lib/consentement.ts). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`,
          }}
        />
        {/* Google Analytics 4 (gtag.js, G-GC1JD019GY) : mesure d'audience,
            chargée après les défauts de consentement ci-dessus — tant que le
            visiteur n'a pas accepté, GA4 ne dépose aucun cookie (Consent Mode v2). */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GC1JD019GY" />
        <script
          dangerouslySetInnerHTML={{
            __html: `gtag('js', new Date());
gtag('config', 'G-GC1JD019GY');`,
          }}
        />
        {/* Google AdSense (ca-pub-6168263680630864) : PAS chargé ici. Le script
            publicitaire n'est injecté qu'après un consentement publicitaire
            explicite (lib/consentement.ts, appelé par le bandeau) — jamais pour
            un visiteur qui n'a pas répondu ou a tout refusé, conformément à la
            promesse du bandeau. Cela allège aussi le chargement des pages
            (~220 Ko de scripts publicitaires évités par défaut). */}
        {/* Google Tag Manager (GTM-KW3MJMTK) : le plus haut possible dans le head. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KW3MJMTK');`,
          }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) : juste après l'ouverture du body. */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KW3MJMTK"
            height={0}
            width={0}
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
        <BandeauCookies />
        {/* Vercel Analytics : pages vues sans cookie ni identificateur
            cross-site, cohérent avec la promesse « sans pistage ». */}
        <Analytics />
      </body>
    </html>
  );
}
