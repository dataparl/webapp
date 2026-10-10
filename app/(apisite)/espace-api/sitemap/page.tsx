import type { Metadata } from "next";

export const metadata: Metadata = { title: "Plan du site", alternates: { canonical: "/sitemap" } };

type Lien = { href: string; libelle: string; externe?: boolean; desc?: string };

const PAGES_API: Lien[] = [
  { href: "/", libelle: "Accueil", desc: "L'API DataParl' en bref : couverture, quota, licence." },
  { href: "/docs", libelle: "Documentation", desc: "Par où commencer : métiers, technique, SDK, machine." },
  { href: "/docs/metiers", libelle: "Documentation · métiers", desc: "Cas d'usage, questions fréquentes, vocabulaire." },
  { href: "/docs/technique", libelle: "Documentation · référence technique", desc: "Endpoints, paramètres, erreurs, quotas." },
  { href: "/docs/sdk", libelle: "Documentation · SDK", desc: "Python et JavaScript/TypeScript." },
  { href: "/docs/machine", libelle: "Documentation · machine à machine", desc: "Clés, en-têtes, pagination." },
  { href: "/docs/mcp", libelle: "Documentation · MCP", desc: "Serveur MCP pour les assistants et agents." },
  { href: "/donnees", libelle: "Jeu de données", desc: "Fiche complète : producteur, licence ODbL, couverture, schéma." },
  { href: "/reutilisations", libelle: "Réutilisations", desc: "Ce que l'on fait des données, et comment partager la tienne." },
  { href: "/request-access", libelle: "Demander une clé", desc: "Gratuite, immédiate, une par compte." },
  { href: "/mon-espace-api", libelle: "Mon espace API", desc: "Clés, quotas, journal des appels." },
];

// Plan du site de l'API (api.dataparl.fr). Les pages légales vivent sur le site
// principal (www.dataparl.fr) ; les conditions propres à l'API y sont servies
// à /informations-legales/cgu-api.
export default function PlanDuSiteApi() {
  return (
    <div className="etroit">
      <h1>Plan du <span className="surligne">site</span></h1>
      <p className="lead">Toutes les pages publiques d&apos;<span className="mono">api.dataparl.fr</span>, le site de l&apos;API DataParl&apos;.</p>
      <ul className="sommaire">
        {PAGES_API.map((l) => (
          <li key={l.href}>
            <a href={l.href}><strong>{l.libelle}</strong><span>{l.desc} →</span></a>
          </li>
        ))}
        <li>
          <a href="https://www.dataparl.fr/informations-legales/cgu-api">
            <strong>Informations légales (conditions d&apos;utilisation de l&apos;API)</strong>
            <span>Sur www.dataparl.fr — avec un lien de retour vers l&apos;API →</span>
          </a>
        </li>
      </ul>
      <p className="meta">
        Plan pour les moteurs : <a href="/sitemap.xml">api.dataparl.fr/sitemap.xml</a>.
        Le site principal : <a href="https://www.dataparl.fr/sitemap">www.dataparl.fr/sitemap</a>.
      </p>
    </div>
  );
}
