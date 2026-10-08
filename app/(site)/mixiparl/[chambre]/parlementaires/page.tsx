import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Tableur from "@/app/_components/Tableur";
import { CHAMBRE_LONG, idParlementaire, nomAffiche } from "@/lib/format";
import { equipeEligible, pct, SEGMENT_CHAMBRE, statsElus, tauxMixite } from "@/lib/stats";

export const revalidate = 3600;
type Props = { params: Promise<{ chambre: string }>; searchParams: Promise<{ ordre?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const seg = (await params).chambre;
  const c = SEGMENT_CHAMBRE[seg];
  if (!c) return {};
  return {
    title: "Mixité des équipes par élu · " + CHAMBRE_LONG[c],
    description: "Le taux de mixité de l'équipe de chaque élu " + (c === "assemblee" ? "de l'Assemblée nationale" : "du Sénat") + ".",
    alternates: { canonical: "/mixiparl/" + seg + "/parlementaires" },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { chambre: seg } = await params;
  const c = SEGMENT_CHAMBRE[seg];
  if (!c) notFound();
  const croissant = (await searchParams).ordre === "moins";
  const tries = (await statsElus().catch(() => []))
    .filter((r) => r.chambre === c && equipeEligible(r))
    // À taux de mixité égal, l'élu qui a le plus de collaborateurs passe devant.
    .sort((a, b) => (tauxMixite(b) ?? 0) - (tauxMixite(a) ?? 0) || (b.femmes + b.hommes) - (a.femmes + a.hommes) || a.elu_nom.localeCompare(b.elu_nom, "fr"))
    .map((r, i) => ({ r, rang: i + 1 }));
  if (croissant) {
    tries.sort((a, b) => (tauxMixite(a.r) ?? 0) - (tauxMixite(b.r) ?? 0) || (b.r.femmes + b.r.hommes) - (a.r.femmes + a.r.hommes) || a.rang - b.rang);
  }
  const autre = seg === "an" ? "senat" : "an";
  const base = "/mixiparl/" + seg + "/parlementaires";
  const entetes = ["Rang", "Élu", "Groupe", "Équipe", "Femmes", "Hommes", "Part de femmes", "Taux de mixité"];
  const donnees = tries.map(({ r, rang }) => [rang, nomAffiche(r.elu_nom), r.elu_groupe ?? "", r.femmes + r.hommes, r.femmes, r.hommes, pct(r.femmes / (r.femmes + r.hommes)), pct(tauxMixite(r))]);
  const liens = tries.map(({ r }) => [
    null,
    "/parlementaires/" + encodeURIComponent(idParlementaire(r.chambre, r.elu_id, r.elu_cle, r.elu_nom)),
    null, null, null, null, null, null,
  ]);
  return (
    <>
      <h1>{CHAMBRE_LONG[c]} : la mixité <span className="surligne-mixi">élu par élu</span></h1>
      <p className="lead">
        {croissant ? "De l'équipe la moins mixte à la plus mixte." : "De l'équipe la plus mixte à la moins mixte."} À taux
        égal, la plus grande équipe passe devant. Équipes de 2 personnes ou plus, toutes de genre déterminé, dans la
        grille DataParl&apos; Sheets (recherche Ctrl+F, export CSV).{" "}
        <a href="/mixiparl/methode#taux-de-mixite">Définition</a> ·{" "}
        <a href={croissant ? base : base + "?ordre=moins"}>{croissant ? "Les plus mixtes d'abord" : "Les moins mixtes d'abord"}</a> ·{" "}
        <a href={"/mixiparl/" + autre + "/parlementaires"}>Voir {autre === "an" ? "l'Assemblée nationale" : "le Sénat"}</a>
      </p>
      <Tableur
        id={"mixiparl-elus-" + seg}
        titre="Mixité des équipes, élu par élu"
        description=""
        provenance="Vue stats_turnover_elus (API DataParl'/Supabase) · méthode MixiParl'"
        entetes={entetes}
        donnees={donnees}
        liens={liens}
        lectureSeule
      />
    </>
  );
}
