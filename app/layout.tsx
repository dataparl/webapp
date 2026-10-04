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
  // Axeptio (CMP certifiée Google, n°260) : renseigner NEXT_PUBLIC_AXEPTIO_CLIENT_ID
  // dans les variables d'environnement Vercel (puis redéployer) pour activer leur
  // bandeau à la place de celui du site. Tant que la variable est vide, le bandeau
  // maison (app/_components/BandeauCookies.tsx) continue de gérer le consentement.
  const axeptio = (process.env.NEXT_PUBLIC_AXEPTIO_CLIENT_ID ?? "").trim();

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Spectral:wght@600;700&display=swap"
        />
        {/* Consent Mode v2 (Google) : tout refusé par défaut, AVANT tout script
            publicitaire. Le bandeau actif (Axeptio, ou celui du site) actualise
            ensuite ces signaux selon le choix du visiteur. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`,
          }}
        />
        {/* Axeptio (si configuré) : SDK du bandeau de consentement (CMP certifiée). */}
        {axeptio && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.axeptioSettings={clientId:"${axeptio.replace(/[^a-zA-Z0-9-]/g, "")}"};
(function(d,s){var t=d.getElementsByTagName(s)[0],e=d.createElement(s);e.async=true;
e.src="//sdk.axept.io/axeptio-sdk.js";t.parentNode.insertBefore(e,t);})(document,"script");`,
            }}
          />
        )}
        {/* Google AdSense : validation du site et diffusion des annonces (ca-pub-6168263680630864). */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6168263680630864" crossOrigin="anonymous" />
        {/* Google Tag Manager (GTM-KW3MJMTK) : le plus haut possible dans le head. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
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
        {axeptio && <div id="axeptio-holder" />}
        {children}
        {!axeptio && <BandeauCookies />}
      </body>
    </html>
  );
}
