import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Feuille from "@/app/_components/Feuille";
import { FEUILLES, feuille } from "@/lib/sheets";

export const revalidate = 3600;

type Props = { params: Promise<{ dataset: string }> };

export function generateStaticParams() {
  return FEUILLES.map((f) => ({ dataset: f.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = feuille((await params).dataset);
  return f
    ? { title: `${f.titre} · DataParl' Sheets`, description: f.description, alternates: { canonical: `/sheets/${f.id}` } }
    : { title: "DataParl' Sheets" };
}

export default async function PageFeuille({ params }: Props) {
  const f = feuille((await params).dataset);
  if (!f) notFound();
  let lignes: Awaited<ReturnType<typeof f.charger>> = [];
  try { lignes = await f.charger(); } catch {}
  return (
    <>
      {lignes.length === 0 ? (
        <p className="erreur">Les données sont momentanément indisponibles. Réessaie dans quelques minutes.</p>
      ) : (
        <Feuille titre={f.titre} description={f.description} provenance={f.provenance} colonnes={f.colonnes} lignes={lignes} />
      )}
    </>
  );
}
