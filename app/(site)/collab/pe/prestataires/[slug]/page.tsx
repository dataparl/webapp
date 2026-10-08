import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GrapheRelations from "@/app/_components/GrapheRelations";
import ListeMouvements from "@/app/_components/ListeMouvements";
import { CarteSiren } from "@/app/_components/Structures";
import {
  structureDepuisSlug, pappers, mouvementsStructure,
  FONCTIONS_STRUCTURES,
} from "@/lib/structures";

export const revalidate = 3600;
const F = FONCTIONS_STRUCTURES["Prestataire de services spécialisé" as const];
const BASE = "/collab/pe/" + F.slug;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await structureDepuisSlug("Prestataire de services spécialisé" as keyof typeof FONCTIONS_STRUCTURES, slug);
  if (!s) return { title: "Structure introuvable" };
  const n = s.clients.length;
  return {
    title: s.nom + " : " + F.court + " employé" + (n > 1 ? "s" : "") + " par " + n + " eurodéputé" + (n > 1 ? "s" : "") + " français",
    description: s.nom + ", " + F.court.toLowerCase() + " du Parlement européen : eurodéputés clients, identification SIREN et mouvements.",
    alternates: { canonical: "https://www.dataparl.fr" + BASE + "/" + slug },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const s = await structureDepuisSlug("Prestataire de services spécialisé" as keyof typeof FONCTIONS_STRUCTURES, slug);
  if (!s) notFound();
  const [info, mouvements] = await Promise.all([pappers(s.nom), mouvementsStructure(s.cle)]);
  return (
    <>
      <p className="meta">
        <Link href={BASE}>{F.titre}</Link>
      </p>
      <h1>{s.nom}</h1>
      <p className="lead">
        {F.court.charAt(0).toUpperCase() + F.court.slice(1)} employé{s.clients.length > 1 ? "s" : ""} par{" "}
        {s.clients.length} eurodéputé{s.clients.length > 1 ? "s" : ""} français au Parlement européen.
      </p>
      <CarteSiren info={info} />
      <h2>Eurodéputés clients</h2>
      <GrapheRelations
        centre={{ id: s.cle, label: s.nom }}
        noeuds={s.clients.map((c) => ({
          id: c.elu_id,
          label: c.elu_nom,
          groupe: c.elu_groupe || undefined,
          href: "/parlementaires/" + encodeURIComponent(c.elu_id),
        }))}
      />
      <p className="meta">
        Chaque eurodéputé du graphe ouvre sa fiche DataParl&apos; (équipe, mouvements, historique).
      </p>
      <h2>Mouvements</h2>
      {mouvements.length === 0 ? (
        <p className="meta">Aucun mouvement depuis le début du suivi (8 octobre 2026).</p>
      ) : (
        <ListeMouvements mouvements={mouvements} />
      )}
    </>
  );
}
