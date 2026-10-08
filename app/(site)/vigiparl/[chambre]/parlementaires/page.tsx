import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Tableur from "@/app/_components/Tableur";
import { CHAMBRE_LONG, idParlementaire, nomAffiche } from "@/lib/format";
import { pct, SEGMENT_CHAMBRE, statsElus, tauxTurnover } from "@/lib/stats";

export const revalidate = 3600;
type Props = { params: Promise<{ chambre: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const seg = (await params).chambre;
  const c = SEGMENT_CHAMBRE[seg];
  if (!c) return {};
  return {
    title: "Renouvellement des équipes par élu · " + CHAMBRE_LONG[c],
    description: "Le classement des élus " + (c === "assemblee" ? "de l'Assemblée nationale" : "du Sénat") + " selon le renouvellement de leur équipe de collaborateurs sur 12 mois.",
    alternates: { canonical: "/vigiparl/" + seg + "/parlementaires" },
  };
}

export default async function Page({ params }: Props) {
  const { chambre: seg } = await params;
  const c = SEGMENT_CHAMBRE[seg];
  if (!c) notFound();
  const tous = (await statsElus().catch(() => []))
    .filter((r) => r.chambre === c && r.effectif + r.departs_12m >= 3)
    .sort((a, b) => (tauxTurnover(b) ?? 0) - (tauxTurnover(a) ?? 0));
  const autre = seg === "an" ? "senat" : "an";
  const entetes = ["Rang", "Élu", "Groupe", "Équipe actuelle", "Départs 12 mois", "Arrivées 12 mois", "Taux"];
  const donnees = tous.map((r, i) => [i + 1, nomAffiche(r.elu_nom), r.elu_groupe ?? "", r.effectif, r.departs_12m, r.arrivees_12m, pct(tauxTurnover(r))]);
  const liens = tous.map((r) => [
    null,
    "/parlementaires/" + encodeURIComponent(idParlementaire(r.chambre, r.elu_id, r.elu_cle, r.elu_nom)),
    null, null, null, null, null,
  ]);
  return (
    <>
      <p className="meta"><a href="/vigiparl">VigiParl&apos;</a></p>
      <h1>{CHAMBRE_LONG[c]} : le renouvellement <span className="surligne-vigi">élu par élu</span></h1>
      <p className="lead">
        Du renouvellement le plus fort au plus faible, sur les 12 derniers mois, dans la grille DataParl&apos; Sheets
        (recherche Ctrl+F, export CSV). Les équipes de moins de 3 personnes sur la période sont écartées.{" "}
        <a href="/vigiparl/methode#taux-12-mois">Définition</a> ·{" "}
        <a href={"/vigiparl/" + autre + "/parlementaires"}>Voir {autre === "an" ? "l'Assemblée nationale" : "le Sénat"}</a>
      </p>
      <Tableur
        id={"vigiparl-elus-" + seg}
        titre="Renouvellement des équipes, élu par élu"
        description=""
        provenance="Vue stats_turnover_elus (API DataParl'/Supabase) · méthode VigiParl'"
        entetes={entetes}
        donnees={donnees}
        liens={liens}
        lectureSeule
      />
    </>
  );
}
