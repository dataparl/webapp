import type { Metadata } from "next";
import Link from "next/link";
import ListeElus, { CHAMBRE_LONG } from "@/app/_components/ListeElus";
import { elusDuParti, partisExistants } from "@/lib/collectifsData";
import { partiDepuisSlug, slugCollectif } from "@/lib/collectifs";
import { couleurParti } from "@/lib/couleurs";

export const revalidate = 3600;
type Props = { params: Promise<{ parti: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).parti;
  const sigle = partiDepuisSlug(slug, await partisExistants().catch(() => []));
  if (!sigle) return { title: "Parti" };
  return {
    title: `Parti ${sigle} : tous ses élus, toutes chambres confondues`,
    description: `Les élus du ${sigle} à l'Assemblée nationale, au Sénat et au Parlement européen : leurs fiches, leurs biographies et leurs équipes de collaborateurs.`,
    alternates: { canonical: `/parti/${slug}` },
  };
}

export default async function FicheParti({ params }: Props) {
  const slug = (await params).parti;
  const sigle = partiDepuisSlug(slug, await partisExistants().catch(() => []));
  if (!sigle) {
    const partis = await partisExistants().catch(() => []);
    return (
      <>
        <h1>Parti introuvable</h1>
        <p className="lead">
          Ce parti n&apos;a pas (ou plus) d&apos;élu actif enregistré : le sigle de l&apos;adresse ne
          correspond à aucun parti du référentiel. Voici les partis et groupes existants :
        </p>
        <p><Link className="btn secondaire" href="/parti">Voir tous les partis</Link></p>
        <div className="pastilles-groupes">
          {partis.map((p) => (
            <Link key={p} className="pastille-groupe" href={`/parti/${slugCollectif(p)}/`} style={{ ["--c" as string]: couleurParti(p) }}>
              <span className="point" />
              {p}
            </Link>
          ))}
        </div>
      </>
    );
  }
  const elus = await elusDuParti(sigle).catch(() => []);
  const parChambre = new Map<string, typeof elus>();
  for (const e of elus) {
    const l = parChambre.get(e.chambre) ?? [];
    l.push(e);
    parChambre.set(e.chambre, l);
  }

  const jsonLd = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: `Parti ${sigle}`, numberOfItems: elus.length,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="meta" style={{ marginTop: 0 }}>
        <a href="/senatoriales2026">← Sénatoriales 2026</a> · <Link href="/parti">← Tous les partis</Link>
      </p>
      <h1>Parti <span className="surligne">{sigle}</span></h1>
      <p className="lead">
        Les {elus.length} élu{elus.length > 1 ? "s" : ""} du {sigle}, toutes chambres confondues — avec pour
        chacun sa fiche, sa biographie et l&apos;équipe de ses collaborateurs.
      </p>
      <p className="meta"><Link href="/groupe">Voir les groupes parlementaires, chambre par chambre</Link></p>
      {[...parChambre.entries()].map(([chambre, l]) => (
        <section key={chambre}>
          <h2>{CHAMBRE_LONG[chambre] ?? chambre} <span className="meta">· {l.length} élu{l.length > 1 ? "s" : ""}</span></h2>
          <ListeElus elus={l} afficher="parti" />
        </section>
      ))}
      {elus.length === 0 && <p className="meta">Aucun élu actif enregistré pour ce parti.</p>}
    </>
  );
}
