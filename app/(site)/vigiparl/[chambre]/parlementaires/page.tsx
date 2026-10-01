import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClassementElus from "@/app/_components/ClassementElus";
import { familleDe } from "@/lib/familles";
import { CHAMBRE_LONG, idParlementaire, nomAffiche } from "@/lib/format";
import { pct, SEGMENT_CHAMBRE, statsElus, tauxTurnover } from "@/lib/stats";

export const revalidate = 3600;
type Props = { params: Promise<{ chambre: string }>; searchParams: Promise<{ page?: string; famille?: string; groupe?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = SEGMENT_CHAMBRE[(await params).chambre];
  if (!c) return {};
  return {
    title: `Renouvellement des équipes par élu · ${CHAMBRE_LONG[c]}`,
    description: `Le classement des élus ${c === "assemblee" ? "de l'Assemblée nationale" : "du Sénat"} selon le renouvellement de leur équipe de collaborateurs sur 12 mois.`,
    alternates: { canonical: `/vigiparl/${(await params).chambre}/parlementaires` },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { chambre: seg } = await params;
  const c = SEGMENT_CHAMBRE[seg];
  if (!c) notFound();
  const q = await searchParams;
  const tous = (await statsElus().catch(() => [])).filter((r) => r.chambre === c && r.effectif + r.departs_12m >= 3)
    .sort((a, b) => (tauxTurnover(b) ?? 0) - (tauxTurnover(a) ?? 0)).map((r, i) => ({ r, rang: i + 1 }));
  const filtre = q.groupe ? { cle: "groupe" as const, valeur: q.groupe.slice(0, 40) } : q.famille ? { cle: "famille" as const, valeur: q.famille.slice(0, 40) } : undefined;
  const retenus = tous.filter(({ r }) => !filtre || (filtre.cle === "groupe" ? r.elu_groupe === filtre.valeur : (familleDe(r.chambre, r.elu_groupe)?.code ?? "Autres") === filtre.valeur));
  const autre = seg === "an" ? "senat" : "an";
  return (
    <>
      <p className="meta"><a href="/vigiparl">VigiParl&apos;</a></p>
      <h1>{CHAMBRE_LONG[c]} : le renouvellement <span className="surligne-vigi">élu par élu</span></h1>
      <p className="lead">Du renouvellement le plus fort au plus faible, sur les 12 derniers mois. Les équipes de moins de 3 personnes sur la période sont écartées. <a href="/vigiparl/methode#taux-12-mois">Définition</a></p>
      <ClassementElus base={`/vigiparl/${seg}/parlementaires`} page={Number(q.page) || 1} filtre={filtre}
        colonnes={["Équipe actuelle", "Départs 12 mois", "Arrivées 12 mois", "Taux"]}
        autreChambre={{ libelle: `Voir ${autre === "an" ? "l'Assemblée nationale" : "le Sénat"}`, href: `/vigiparl/${autre}/parlementaires${filtre?.cle === "famille" ? `?famille=${encodeURIComponent(filtre.valeur)}` : ""}` }}
        lignes={retenus.map(({ r, rang }) => ({
          nom: nomAffiche(r.elu_nom), groupe: r.elu_groupe, rang,
          href: `/parlementaires/${encodeURIComponent(idParlementaire(r.chambre, r.elu_id, r.elu_cle, r.elu_nom))}`,
          valeurs: [String(r.effectif), String(r.departs_12m), String(r.arrivees_12m), pct(tauxTurnover(r))],
        }))} />
    </>
  );
}
