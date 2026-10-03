import type { Metadata } from "next";
import Link from "next/link";
import ListeElus, { CHAMBRE_LONG } from "@/app/_components/ListeElus";
import { elusDuGroupe, groupesExistants } from "@/lib/collectifsData";
import { CHAMBRE_COURTE, hrefParti, groupeDepuisSlug, slugCollectif } from "@/lib/collectifs";

export const revalidate = 3600;
type Props = { params: Promise<{ groupe: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).groupe;
  const g = groupeDepuisSlug(slug, await groupesExistants().catch(() => []));
  if (!g) return { title: "Groupe parlementaire" };
  const titre = `Groupe ${g.groupe_libelle || g.groupe} — ${CHAMBRE_LONG[g.chambre]}`;
  return {
    title: titre,
    description: `Les élus du groupe ${g.groupe_libelle || g.groupe} à ${CHAMBRE_LONG[g.chambre]} : leurs fiches, leurs biographies, leurs équipes de collaborateurs et leurs mouvements.`,
    alternates: { canonical: `/groupe/${slug}` },
  };
}

export default async function FicheGroupe({ params }: Props) {
  const slug = (await params).groupe;
  const groupes = await groupesExistants().catch(() => []);
  const g = groupeDepuisSlug(slug, groupes);
  if (!g) {
    const existants = groupes.map((x) => `/groupe/${CHAMBRE_COURTE[x.chambre]}-${slugCollectif(x.groupe)}/`);
    return (
      <>
        <h1>Groupe introuvable</h1>
        <p className="meta">Ce groupe n&apos;existe pas (ou plus). <Link href="/groupe">Voir tous les groupes</Link>.</p>
        {existants.length > 0 && <p className="meta">Groupes existants : {existants.slice(0, 40).join(", ")}…</p>}
      </>
    );
  }
  const elus = await elusDuGroupe(g.chambre, g.groupe).catch(() => []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Groupe ${g.groupe_libelle || g.groupe} — ${CHAMBRE_LONG[g.chambre]}`,
    numberOfItems: elus.length,
  };
  const filAriane = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Groupes parlementaires", item: "https://www.dataparl.fr/groupe" },
      { "@type": "ListItem", position: 2, name: `Groupe ${g.groupe}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(filAriane).replace(/</g, "\\u003c") }} />
      <p className="meta" style={{ marginTop: 0 }}>
        <a href="/senatoriales2026">← Sénatoriales 2026</a> · <a href="/groupe">← Tous les groupes</a>
      </p>
      <h1>Groupe <span className="surligne">{g.groupe_libelle || g.groupe}</span> — {CHAMBRE_LONG[g.chambre]}</h1>
      <p className="lead">
        Les {elus.length} élu{elus.length > 1 ? "s" : ""} du groupe {g.groupe} à {CHAMBRE_LONG[g.chambre]}, avec pour chacun sa fiche,
        sa biographie et l&apos;équipe de ses collaborateurs.
      </p>
      <p className="meta">
        Voir aussi : <a href={hrefParti(g.groupe) ?? "#"}>la fiche du parti {g.groupe}, toutes chambres confondues</a>
        {" "}<Link href="/parlementaires">· tous les parlementaires</Link>
      </p>
      <h2>Les élus du groupe</h2>
      <ListeElus elus={elus} afficher="groupe" />
    </>
  );
}
