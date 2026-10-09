import type { Metadata } from "next";
import Link from "next/link";
import ListeElus, { CHAMBRE_LONG } from "@/app/_components/ListeElus";
import { elusDuParti, partisExistants } from "@/lib/collectifsData";
import { partiDepuisSlug, slugCollectif } from "@/lib/collectifs";
import { couleurParti } from "@/lib/couleurs";
import { libelleParti, nomCompletParti } from "@/lib/partisNoms";

export const revalidate = 3600;
type Props = { params: Promise<{ parti: string }> };

// /parti/<parti> : la fiche des élus d'un parti, toutes chambres confondues.
// Le titre, le H1 et la réponse directe portent le nom complet du parti
// (« Élus du Rassemblement National (RN) ») : c'est ce que cherchent les
// internautes et ce que citent moteurs et assistants IA.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).parti;
  const sigle = partiDepuisSlug(slug, await partisExistants().catch(() => []));
  if (!sigle) return { title: "Parti" };
  const complet = nomCompletParti(sigle);
  return {
    title: "Élus du " + complet + (complet !== sigle ? " (" + sigle + ")" : "") + " : la liste complète",
    description: "Tous les élus du " + complet + " : députés à l'Assemblée nationale, sénateurs et députés européens, avec la fiche, la biographie et l'équipe de collaborateurs de chacun.",
    alternates: { canonical: "/parti/" + slug },
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
        <p><L
ink className="btn secondaire" href="/parti">Voir tous les partis</Link></p>
        <div className="pastilles-groupes">
          {partis.map((p) => (
            <Link key={p} className="pastille-groupe" href={`/parti/${slugCollectif(p)}/`} style={{ ["--c" as string]: couleurParti(p) }}>
              <span className="point" />
              {libelleParti(p)}
            </Link>
          ))}
        </div>
      </>
    );
  }
  const complet = nomCompletParti(sigle);
  const elus = await elusDuParti(sigle).catch(() => []);
  const parChambre = new Map<string, typeof elus>();
  for (const e of elus) {
    const l = parChambre.get(e.chambre) ?? [];
    l.push(e);
    parChambre.set(e.chambre, l);
  }
  const nomsChambres = [...parChambre.keys()].map((c) => CHAMBRE_LONG[c] ?? c);
  const nbAN = parChambre.get("assemblee")?.length ?? 0;
  const nbSenat = parChambre.get("senat")?.length ?? 0;
  const nbPE = parChambre.get("europarl")?.length ?? 0;

  const faq = [
    {
      q: "Combien d'élus le " + complet + " a-t-il ?",
      r: "Le " + complet + " compte " + elus.length + " élu" + (elus.length > 1 ? "s" : "") + " actif" + (elus.length > 1 ? "s" : "") + " suivi" + (elus.length > 1 ? "s" : "") + " par DataParl'"
        + (nbAN ? " : " + nbAN + " député" + (nbAN > 1 ? "s" : "") + " à l'Assemblée nationale" : "")
        + (nbSenat ? (nbAN ? ", " : " : ") + nbSenat + " sénateur" + (nbSenat > 1 ? "s" : "") + " au Sénat" : "")
        + (nbPE ? (nbAN || nbSenat ? " et " : " : ") + nbPE + " député" + (nbPE > 1 ? "s" : "") + " européen" + (nbPE > 1 ? "s" : "") : "")
        + ". La liste complète, avec la fiche et la biographie de chacun, est sur cette page.",
    },
    {
      q: "Qui sont les élus du " + sigle + " ?",
      r: "Les élus " + sigle + " sont listés ci-dessous, chambre par chambre, avec photo, circonscription et liens vers la biographie et l'équipe de collaborateurs de chacun. Toute personne élue sous une autre étiquette apparentée figure sur la fiche d
u parti concerné.",
    },
    {
      q: "Qui sont les collaborateurs des élus du " + complet + " ?",
      r: "Chaque fiche d'élu présente son équipe de collaborateurs en poste. La liste de tous les collaborateurs des élus du " + sigle + ", élu employeur par élu employeur, est publiée sur la page « Collaborateurs du parti " + sigle + " ».",
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "ItemList",
      name: "Élus du " + complet,
      numberOfItems: elus.length,
    },
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.r } })),
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Partis politiques", item: "https://www.dataparl.fr/parti" },
        { "@type": "ListItem", position: 2, name: complet },
      ],
    },
  ];

  return (
    <>
      {jsonLd.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j).replace(/</g, "\\u003c") }} />
      ))}
      <p className="meta" style={{ marginTop: 0 }}>
        <Link href="/parti">← Tous les partis</Link>
      </p>
      <h1>Élus du <span className="surligne">{complet}</span>{complet !== sigle ? <span className="meta"> ({sigle})</span> : null}</h1>
      <p className="lead">
        Les {elus.length} élu{elus.length > 1 ? "s" : ""} du {complet}, toutes chambres confondues
        {nomsChambres.length ? " (" + nomsChambres.join(", ") + ")" : ""} : pour chacun, sa fiche, sa
        biographie et l&apos;équipe de ses collaborateurs.{" "}
        <a href={"/collab/parti/" + slug}>La liste des collaborateurs des élus {sigle} →</a>
      </p>
      {[...parChambre.entries()].map(([chambre, l]) => (
        <section key={chambre}>
          <h2 id={chambre}>{CHAMBRE_LONG[chambre] ?? chambre} <
span className="meta">· {l.length} élu{l.length > 1 ? "s" : ""} {sigle}</span></h2>
          <ListeElus elus={l} afficher="parti" />
        </section>
      ))}
      {elus.length === 0 && <p className="meta">Aucun élu actif enregistré pour ce parti.</p>}
      <h2 id="faq">Questions fréquentes</h2>
      <dl>
        {faq.map((f) => (
          <div key={f.q}>
            <dt><strong>{f.q}</strong></dt>
            <dd>{f.r}</dd>
          </div>
        ))}
      </dl>
      <p className="meta">
        <Link href={"/collab/parti/" + slug}>Collaborateurs du parti</Link> ·{" "}
        <Link href="/groupe">Groupes parlementaires</Link> · Les effectifs sont mis à jour quotidiennement
        d&apos;après les publications officielles.
      </p>
    </>
  );
}
