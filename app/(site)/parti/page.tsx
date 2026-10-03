import type { Metadata } from "next";
import Link from "next/link";
import { partisExistants } from "@/lib/collectifsData";
import { hrefParti } from "@/lib/collectifs";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Partis politiques : leurs élus dans toutes les chambres",
  description: "Une fiche par parti : ses députés, ses sénateurs et ses députés européens, toutes chambres confondues — avec l'équipe de collaborateurs de chaque élu.",
  alternates: { canonical: "/parti" },
};

export default async function IndexPartis() {
  const partis = await partisExistants().catch(() => []);
  return (
    <>
      <h1>Partis politiques</h1>
      <p className="lead">
        Une fiche par parti : tous ses élus, de l&apos;Assemblée nationale au Parlement européen,
        toutes chambres confondues. Les groupes parlementaires (par chambre) ont chacun leur fiche :{" "}
        <Link href="/groupe">voir tous les groupes</Link>.
      </p>
      <ul className="liste-deps">
        {partis.map((p) => (
          <li key={p}><a href={hrefParti(p) ?? "#"}>Parti {p}</a></li>
        ))}
      </ul>
    </>
  );
}
