import type { Metadata } from "next";
import Autocompletion from "@/app/_components/Autocompletion";
import { familleDe } from "@/lib/familles";
import { CHAMBRE_LONG, prenomNom } from "@/lib/format";
import { tousLesParlementaires, type EluCompact } from "@/lib/referentiel";

export const metadata: Metadata = { title: "Parlementaires" };
export const revalidate = 3600;

export default async function Parlementaires() {
  let elus: EluCompact[] = [];
  try { elus = await tousLesParlementaires(); } catch {}
  const actifs = elus.filter((e) => e.a);
  const parChambre = (["assemblee", "senat", "europarl"] as const)
    .map((c) => ({ c, liste: actifs.filter((e) => e.c === c).sort((a, b) => a.n.localeCompare(b.n, "fr")) }))
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
      {parChambre.map(({ c, liste }) => (
        <section key={c}>
          <h2>{CHAMBRE_LONG[c]} <span className="meta">({liste.length})</span></h2>
          <p style={{ columns: "16rem", lineHeight: 1.9 }}>
            {liste.map((e) => {
              const fam = e.g ? familleDe(c, e.g) : null;
              return (
                <span key={e.s} style={{ display: "block" }}>
                  <a href={`/parlementaires/${encodeURIComponent(e.s)}`}>{prenomNom(e.p, e.n)}</a>
                  {e.g && <span className="meta" title={fam ? `Famille ${fam.code} · ${fam.libelle}` : undefined}> · {e.g}</span>}
                </span>
              );
            })}
          </p>
        </section>
      ))}
    </>
  );
}
