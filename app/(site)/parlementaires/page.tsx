import type { Metadata } from "next";
import Autocompletion from "@/app/_components/Autocompletion";
import { tousLesParlementaires, type EluCompact } from "@/lib/referentiel";

export const metadata: Metadata = { title: "Parlementaires", alternates: { canonical: "/parlementaires" } };
export const revalidate = 3600;

export default async function Parlementaires() {
  let elus: EluCompact[] = [];
  try { elus = await tousLesParlementaires(); } catch {}
  const actifs = elus.filter((e) => e.a);
  const parChambre = (["assemblee", "senat", "europarl"] as const)
    .map((c) => ({ c, liste: actifs.filter((e) => e.c === c) }))
    .filter((x) => x.liste.length);
  return (
    <>
      <h1>Les <span className="surligne">parlementaires</span></h1>
      <p className="lead">
        Chaque élu, son équipe, ses mandats et ses commissions. Les anciens parlementaires (depuis 1997 à l&apos;Assemblée,
        2008 au Sénat, 2009 au Parlement européen) sont accessibles par la recherche.
      </p>
      <div className="recherche-globale">
        <Autocompletion id="recherche-elu" source="elus" navigation placeholder="Rechercher un parlementaire, en fonction ou non" ariaLabel="Rechercher un parlementaire" />
      </div>
      <div className="chiffres">
        {parChambre.map(({ c, liste }) => (
          <div key={c}><strong>{liste.length.toLocaleString("fr-FR")}</strong><span>{c === "assemblee" ? "députés" : c === "senat" ? "sénateurs" : "eurodéputés français"} en fonction</span></div>
        ))}
      </div>
      <p className="meta">Tapez un nom pour ouvrir une fiche. Classements par élu : <a href="/vigiparl">VigiParl&apos;</a> (renouvellement) et <a href="/mixiparl">MixiParl&apos;</a> (mixité).</p>
    </>
  );
}
