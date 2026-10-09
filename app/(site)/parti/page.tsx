import type { Metadata } from "next";
import Link from "next/link";
import { partisExistants } from "@/lib/collectifsData";
import { hrefParti, slugCollectif } from "@/lib/collectifs";
import { libelleParti } from "@/lib/partisNoms";

export const revalidate = 3600;

// /parti : l'index des fiches par parti. Chaque intitulé porte le nom
// complet du parti (« Élus du Rassemblement National (RN) ») : c'est la
// requête des internautes, pas le sigle seul.
export const metadata: Metadata = {
  title: "Élus de chaque parti : députés, sénateurs, députés européens",
  description: "Les élus du Rassemblement National, de Renaissance, des Républicains, de La France insoumise… : pour chaque parti, ses députés, sénateurs et députés européens, et l'équipe de collaborateurs de chacun.",
  alternates: { canonical: "/parti" },
};

export default async function IndexPartis() {
  const partis = await partisExistants().catch(() => []);
  return (
    <>
      <h1>Élus <span className="surligne">par parti politique</span></h1>
      <p className="lead">
        Une fiche par parti : tous ses élus, de l&apos;Assemblée nationale au Parlement européen, toutes
        chambres confondues — avec pour chacun sa fiche, sa biographie et l&apos;équipe de ses
        collaborateurs. Les groupes parlementaires (chambre par chambre) ont aussi leur fiche :{" "}
        <Link href="/groupe">voir tous les groupes</Link>. Les collaborateurs de chaque parti :{" "}
        <Link href="/collab/parti">collaborateurs par parti</Link>.
      </p>
      <ul className="liste-deps">
        {partis.map((p) => (
          <li key={p}>
            <a href={hrefParti(p) ?? "#"}>{"Élus du " + libelleParti(p)}</a>
            <span className="meta">{" · députés, sénateurs, députés européens"}</span>
          </li>
        ))}
      </ul>
      {partis.length === 0 && <p className="meta">Aucun parti actif enregistré pour l&apos;instant.</p>}
    </>
  );
}
