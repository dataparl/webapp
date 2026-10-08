import type { Metadata } from "next";
import Link from "next/link";
import { structures, pappers, FONCTIONS_STRUCTURES, slugStructure } from "@/lib/structures";
import { TableStructures } from "@/app/_components/Structures";

export const revalidate = 3600;

const F = FONCTIONS_STRUCTURES["Tiers payant" as const];

export const metadata: Metadata = {
  title: `Tiers payants du Parlement européen : quelles sociétés gèrent les contrats des eurodéputés français`,
  description: `Liste des tiers payants employés par les eurodéputés français au Parlement européen : sociétés, forme juridique, SIREN et clients parlementaires.`,
  alternates: { canonical: `https://www.dataparl.fr/collab/${F.slug}` },
};

export default async function Page() {
  const liste = await structures("Tiers payant" as keyof typeof FONCTIONS_STRUCTURES);
  const siren: Record<string, (Awaited<ReturnType<typeof pappers>>)> = {};
  for (const s of liste.slice(0, 100)) {
    siren[s.cle] = await pappers(s.nom);
  }
  const nClients = new Set(liste.flatMap((s) => s.clients.map((c) => c.elu_id))).size;
  return (
    <>
      <p className="meta">Parlement européen · eurodéputés français</p>
      <h1>{F.titre}</h1>
      <p className="lead">
        {F.definition} DataParl' recense ici toutes les structures employées par les {nClients} eurodéputés
        français suivis — une information publique mais jamais agrégée jusqu'ici, au-delà de la page « assistants »
        du Parlement européen.
      </p>
      <TableStructures liste={liste} siren={siren} hrefBase={`/collab/${F.slug}`} />
      <p className="meta">
        Suivi quotidien depuis le 8 octobre 2026 ; les arrivées et départs de structures apparaissent dans les{" "}
        <Link href="/mouvements?chambre=europarl">mouvements europarl</Link>. Identification SIREN via le registre
        des entreprises (Pappers) pour les structures appariées.
      </p>
    </>
  );
}
