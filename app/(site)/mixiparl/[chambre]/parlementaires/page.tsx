import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClassementElus from "@/app/_components/ClassementElus";
import { familleDe } from "@/lib/familles";
import { CHAMBRE_LONG, idParlementaire, nomAffiche } from "@/lib/format";
import { equipeEligible, pct, SEGMENT_CHAMBRE, statsElus, tauxMixite } from "@/lib/stats";

export const revalidate = 3600;
type Props = { params: Promise<{ chambre: string }>; searchParams: Promise<{ page?: string; famille?: string; groupe?: string; ordre?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chambre } = await params;
  const c = SEGMENT_CHAMBRE[chambre];
  if (!c) return {};
  return {
    title: `Mixité des équipes par élu · ${CHAMBRE_LONG[c]}`,
    description: `Le taux de mixité de l'équipe de chaque élu ${c === "assemblee" ? "de l'Assemblée nationale" : "du Sénat"}.`,
    alternates: { canonical: `/mixiparl/${chambre}/parlementaires` },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { chambre: seg } = await params;
  const c = SEGMENT_CHAMBRE[seg];
  if (!c) notFound();
  const q = await searchParams;
  const croissant = q.ordre === "moins";
  const tous = (await statsElus().catch(() => [])).filter((r) => r.chambre === c && equipeEligible(r))
    // À taux de mixité égal, l'élu qui a le plus de collaborateurs passe devant.
    .sort((a, b) => (tauxMixite(b) ?? 0) - (tauxMixite(a) ?? 0) || (b.femmes + b.hommes) - (a.femmes + a.hommes) || a.elu_nom.localeCompare(b.elu_nom, "fr")).map((r, i) => ({ r, rang: i + 1 }));
  if (croissant) tous.sort((a, b) => (tauxMixite(a.r) ?? 0) - (tauxMixite(b.r) ?? 0) || (b.r.femmes + b.r.hommes) - (a.r.femmes + a.r.hommes) || a.rang - b.rang);
  const filtre = q.groupe ? { cle: "groupe" as const, valeur: q.groupe.slice(0, 40) } : q.famille ? { cle: "famille" as const, valeur: q.famille.slice(0, 40) } : undefined;
  const retenus = tous.filter(({ r }) => !filtre || (filtre.cle === "groupe" ? r.elu_groupe === filtre.valeur : (familleDe(r.chambre, r.elu_groupe)?.code ?? "Autres") === filtre.valeur));
  const autre = seg === "an" ? "senat" : "an";
  const base = `/mixiparl/${seg}/parlementaires`;
  return (
    <>
      <h1>{CHAMBRE_LONG[c]} : la mixité <span className="surligne-mixi">élu par élu</span></h1>
      <p className="lead">{croissant ? "De l'équipe la moins mixte à la plus mixte." : "De l'équipe la plus mixte à la moins mixte."} À taux égal, la plus grande équipe passe devant. Équipes de 2 personnes ou plus, toutes de genre déterminé. <a href="/mixiparl/methode#taux-de-mixite">Définition</a></p>
      <ClassementElus base={base} page={Number(q.page) || 1} filtre={filtre}
        colonnes={["Équipe", "Femmes", "Hommes", "Part de femmes", "Taux de mixité"]}
        ordre={croissant ? { libelle: "Les plus mixtes d'abord", href: base } : { libelle: "Les moins mixtes d'abord", href: `${base}?ordre=moins` }}
        autreChambre={{ libelle: `Voir ${autre === "an" ? "l'Assemblée nationale" : "le Sénat"}`, href: `/mixiparl/${autre}/parlementaires${filtre?.cle === "famille" ? `?famille=${encodeURIComponent(filtre.valeur)}` : ""}` }}
        lignes={retenus.map(({ r, rang }) => ({
          nom: nomAffiche(r.elu_nom), groupe: r.elu_groupe, rang,
          href: `/parlementaires/${encodeURIComponent(idParlementaire(r.chambre, r.elu_id, r.elu_cle, r.elu_nom))}`,
          valeurs: [String(r.femmes + r.hommes), String(r.femmes), String(r.hommes), pct(r.femmes / (r.femmes + r.hommes)), pct(tauxMixite(r))],
        }))} />
    </>
  );
}
