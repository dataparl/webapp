const ONGLETS = [
  { slug: "parlement", nom: "Les trois chambres" },
  { slug: "assemblee", nom: "Assemblée nationale" },
  { slug: "senat", nom: "Sénat" },
  { slug: "europarl", nom: "Parlement européen" },
];

export default function Onglets({ actif }: { actif: string }) {
  return (
    <nav className="onglets-pages" aria-label="Chambres">
      {ONGLETS.map((o) => (
        <a key={o.slug} href={`/mouvements/${o.slug}`} aria-current={o.slug === actif ? "page" : undefined}>{o.nom}</a>
      ))}
    </nav>
  );
}
