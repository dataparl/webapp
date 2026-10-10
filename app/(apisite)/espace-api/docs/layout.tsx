const PAGES = [
  { href: "/docs", nom: "Vue d'ensemble" },
  { href: "/docs/technique", nom: "Technique" },
  { href: "/docs/playground", nom: "Playground" },
  { href: "/docs/metiers", nom: "Cas d'usage" },
  { href: "/docs/machine", nom: "Machines" },
  { href: "/docs/sdk", nom: "Exemples de code" },
  { href: "/docs/mcp", nom: "MCP" },
  { href: "/docs/feuille-de-route", nom: "Feuille de route" },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal etroit">
      <nav className="onglets-pages" aria-label="Documentation">
        {PAGES.map((p) => <a key={p.href} href={p.href}>{p.nom}</a>)}
      </nav>
      {children}
    </div>
  );
}
