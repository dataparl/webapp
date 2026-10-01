import type { Metadata } from "next";
import { PiedDePage } from "@/app/_components/SiteChrome";

export const metadata: Metadata = {
  title: { default: "API DataParl'", template: "%s | API DataParl'" },
  description: "L'API des mouvements de collaborateurs parlementaires : gratuite, avec une clé personnelle.",
  metadataBase: new URL("https://api.dataparl.fr"),
  openGraph: { siteName: "API DataParl'", locale: "fr_FR", type: "website" },
};

export default function ApiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <header className="site">
        <div className="wrap">
          <a className="logo" href="/" aria-label="API DataParl', accueil">
            Data<span className="surligne">Parl&apos;</span> <span style={{ color: "var(--bleu)" }}>API</span>
          </a>
          <nav aria-label="Navigation de l'API">
            <a href="/docs">Documentation</a>
            <a href="/mon-espace-api">Mon espace API</a>
            <a href="https://www.dataparl.fr/">Le site</a>
          </nav>
        </div>
      </header>
      <main><div className="wrap">{children}</div></main>
      <PiedDePage />
    </div>
  );
}
