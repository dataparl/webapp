import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Photo from "@/app/_components/Photo";
import { prenomNom } from "@/lib/format";
import { moisAnnee } from "@/lib/periodes";
import { SCRUTIN_2026, senatoriales2026, type Senateur } from "@/lib/senatoriales";

export const revalidate = 3600;
type Props = { params: Promise<{ departement: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent((await params).departement);
  const tous = await senatoriales2026().catch(() => null);
  const d = tous?.departements.find((x) => x.slug === slug);
  if (!d) return { title: "Sénatoriales 2026" };
  const titre = `Sénatoriales 2026 : ${d.nom}`;
  const description = `Sénatoriales 2026 en ${d.nom} : les ${d.nouveaux.length} nouveaux sénateurs élus, les sortants, leurs groupes politiques, leurs fiches et leurs équipes de collaborateurs.`;
  return {
    title: titre, description,
    alternates: { canonical: `/senatoriales2026/${d.slug}` },
    openGraph: { title: `${titre} · DataParl'`, description, url: `https://www.dataparl.fr/senatoriales2026/${d.slug}`, type: "article" },
  };
}

function CarteSenateur({ s, sortant }: { s: Senateur; sortant?: boolean }) {
  const nom = prenomNom(s.prenom, s.nom);
  return (
    <div className="carte-elu">
      <Photo chambre="senat" slug={s.slug} src={s.photo_url} nom={nom} taille={64} />
      <div>
        <p style={{ margin: 0, fontWeight: 700 }}>
          <a href={`/parlementaires/${encodeURIComponent(s.slug)}`}>{nom}</a>
        </p>
        <p className="meta" style={{ margin: "2px 0" }}>
          {s.groupe ? `Groupe ${s.groupe}` : "Sans groupe renseigné"}
          {sortant
            ? s.fin ? ` · mandat terminé en ${moisAnnee(s.fin)}` : ""
            : s.debut ? ` · élu${s.civilite === "Mme" ? "e" : ""} en ${moisAnnee(s.debut)}` : ""}
        </p>
        <p className="meta" style={{ margin: 0 }}>
          <a href={`/parlementaires/${encodeURIComponent(s.slug)}/bio`}>Biographie</a>
        </p>
      </div>
    </div>
  );
}

export default async function DepartementSenatoriales({ params }: Props) {
  const slug = decodeURIComponent((await params).departement);
  const tous = await senatoriales2026().catch(() => null);
  const d = tous?.departements.find((x) => x.slug === slug);
  if (!d) notFound();
  const reelusIds = new Set(d.nouveaux.map((s) => s.personne_id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Sénatoriales 2026 : ${d.nom}`,
    numberOfItems: d.nouveaux.length,
    itemListElement: d.nouveaux.map((s, i) => ({
      "@type": "ListItem", position: i + 1,
      item: { "@type": "Person", name: prenomNom(s.prenom, s.nom), url: `https://www.dataparl.fr/parlementaires/${encodeURIComponent(s.slug)}` },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="meta" style={{ marginTop: 0 }}><a href="/senatoriales2026">← Sénatoriales 2026 : tous les départements</a></p>
      <h1>Sénatoriales 2026 : <span className="surligne">{d.nom}</span></h1>
      <p className="lead">
        À l&apos;automne {SCRUTIN_2026.annee}, les grands électeurs du département ont élu
        {" "}{d.nouveaux.length} nouveau{d.nouveaux.length > 1 ? "x" : ""} sénateur{d.nouveaux.length > 1 ? "s" : ""} pour six ans.
        Retrouvez ci-dessous les élus qui entrent au Sénat, les sénateurs sortants, leurs groupes politiques —
        et pour chacun, son équipe de collaborateurs suivie par DataParl&apos;.
      </p>

      <h2>Les nouveaux sénateurs élus en {d.nom}</h2>
      {d.nouveaux.length === 0 ? (
        <p className="meta">Aucun nouveau sénateur enregistré pour l&apos;instant{d.sortants.length ? " ; les sortants sont listés plus bas." : "."}</p>
      ) : (
        <div className="grille-senateurs">
          {d.nouveaux.map((s) => <CarteSenateur key={s.personne_id} s={s} />)}
        </div>
      )}

      <h2>Les sénateurs sortants</h2>
      {d.sortants.length === 0 ? (
        <p className="meta">Aucun départ enregistré pour ce scrutin.</p>
      ) : (
        <table className="stats">
          <thead><tr><th>Sénateur sortant</th><th>De</th><th>Sortie</th></tr></thead>
          <tbody>
            {d.sortants.map((s) => (
              <tr key={s.personne_id}>
                <td>
                  <a href={`/parlementaires/${encodeURIComponent(s.slug)}`}>{prenomNom(s.prenom, s.nom)}</a>
                  {reelusIds.has(s.personne_id) && <span className="puce">réélu{reelusIds.has(s.personne_id) && s.civilite === "Mme" ? "e" : ""}</span>}
                </td>
                <td>{s.debut ? moisAnnee(s.debut) : "—"}</td>
                <td>{s.fin ? moisAnnee(s.fin) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Après l&apos;élection : les équipes des nouveaux sénateurs</h2>
      <p>
        Chaque nouveau sénateur installe un cabinet parlementaire : collaborateurs, assistants de groupe, attachés
        parlementaires. DataParl&apos; relit chaque semaine les listes officielles publiées par le Sénat pour suivre
        qui entre dans ces équipes, qui les quitte, et quels collaborateurs passent d&apos;un élu à l&apos;autre —
        y compris entre l&apos;Assemblée nationale et le Sénat.
      </p>
      <p className="meta">
        <a href="/mouvements/senat">Les mouvements au Sénat</a> · <a href="/collab">Rechercher un collaborateur</a> ·{" "}
        <a href="/senatoriales2026">Tous les départements</a>
      </p>
    </>
  );
}
