import type { Metadata } from "next";
import { referentiel, type Elu } from "@/lib/data";
import { CHAMBRE_LONG, idParlementaire } from "@/lib/format";

export const metadata: Metadata = { title: "Parlementaires" };
export const revalidate = 3600;

export default async function Parlementaires() {
  let elus: Elu[] = [];
  try { elus = await referentiel(); } catch {}
  const parChambre = ["assemblee", "senat", "europarl"].map((c) => ({ c, liste: elus.filter((e) => e.chambre === c) })).filter((x) => x.liste.length);
  return (
    <>
      <h1>Les <span className="surligne">parlementaires</span></h1>
      <p className="lead">Chaque élu suivi par DataParl&apos;, avec son équipe et ses mouvements.</p>
      {parChambre.map(({ c, liste }) => (
        <section key={c}>
          <h2>{CHAMBRE_LONG[c]} <span className="meta">({liste.length})</span></h2>
          <p style={{ columns: "16rem", lineHeight: 1.9 }}>
            {liste.map((e) => (
              <span key={e.cle} style={{ display: "block" }}>
                <a href={`/parlementaires/${encodeURIComponent(idParlementaire(e.chambre, e.id, e.cle, e.nom))}`}>{e.nom}</a>
                {e.groupe && <span className="meta"> · {e.groupe}</span>}
              </span>
            ))}
          </p>
        </section>
      ))}
    </>
  );
}
