import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Photo from "@/app/_components/Photo";
import { CHAMBRE_LONG, prenomNom } from "@/lib/format";
import { parlementaireDepuisId, personne } from "@/lib/referentiel";
import HistoriqueEquipe from "./HistoriqueEquipe";

export const revalidate = 3600;
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await parlementaireDepuisId(decodeURIComponent((await params).id)).catch(() => null);
  return { title: f ? `${prenomNom(f.prenom, f.nom)} : historique des collaborateurs` : "Historique des collaborateurs", robots: { index: false, follow: true } };
}

export default async function Historique({ params }: Props) {
  const f = await parlementaireDepuisId(decodeURIComponent((await params).id)).catch(() => null);
  if (!f) notFound();
  const { fiches } = await personne(f.personne_id);
  const nom = prenomNom(f.prenom, f.nom);
  return (
    <>
      <div className="entete-elu petite">
        <Photo src={f.photo_url} nom={nom} taille={64} />
        <div>
          <p className="meta" style={{ margin: 0 }}><a href={`/parlementaires/${encodeURIComponent(f.slug)}`}>← Fiche de {nom}</a></p>
          <h1 style={{ margin: "2px 0" }}>Historique des collaborateurs</h1>
          <p className="meta" style={{ margin: 0 }}>{fiches.map((x) => CHAMBRE_LONG[x.chambre]).join(", ")}</p>
        </div>
      </div>
      <p className="lead">
        Toutes les personnes qui ont travaillé pour {nom}, dans chaque chambre où l&apos;élu a siégé, d&apos;après les listes
        officielles publiées depuis 2015 (Sénat) et 2017 (Assemblée).
      </p>
      <HistoriqueEquipe personne={f.personne_id} suite={`/parlementaires/${f.slug}/historique`} multi={fiches.length > 1} />
    </>
  );
}
