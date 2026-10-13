import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prenomNom } from "@/lib/format";
import { ORDRE_FONCTION, categorieFonction, periode } from "@/lib/gouvernementTypes";
import { autresMandats, cabinetsDuMinistre, ficheMinistre } from "@/lib/gouvernement";

export const revalidate = 3600;
type Props = { params: Promise<{ id: string }> };
const ID_OK = /^[A-Za-z0-9._-]{1,80}$/;

// Fiches ministres indexables : mandats et cabinets publiés au Journal officiel.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = decodeURIComponent((await params).id);
  if (!ID_OK.test(id)) return {};
  const m = await ficheMinistre(id).catch(() => null);
  if (!m) return {};
  const nom = prenomNom(m.prenom, m.nom);
  return {
    title: nom + " : ministre, portefeuille et cabinet",
    description: "Mandats de " + nom + " (" + (m.portefeuille || m.fonction) + ", gouvernement " + m.gouvernement + ") et composition de son cabinet ministériel d'après le Journal officiel.",
    alternates: { canonical: "/gouvernement/m/" + encodeURIComponent(m.id) },
  };
}

export default async function FicheMinistre({ params }: Props) {
  const id = decodeURIComponent((await params).id);
  if (!ID_OK.test(id)) notFound();
  const m = await ficheMinistre(id).catch(() => null);
  if (!m) notFound();
  const [cabinets, mandats] = await Promise.all([cabinetsDuMinistre(m.id), autresMandats(m)]);
  // Le cabinet d'abord par rang (direction, chefferie, conseillers), puis par nom.
  const equipe = [...cabinets].sort(
    (a, b) =>
      ORDRE_FONCTION[categorieFonction(a.fonction)] - ORDRE_FONCTION[categorieFonction(b.fonction)] ||
      a.collab_nom.localeCompare(b.collab_nom, "fr"),
  );
  const nom = prenomNom(m.prenom, m.nom);

  return (
    <>
      <p className="meta" style={{ marginBottom: 0 }}>
        {m.gouvernement} · <a href="/gouvernement">tous les gouvernements</a>
      </p>
      <h1>{nom}</h1>
      <p className="lead">
        {(m.portefeuille || m.fonction || "Ministre") + " — " + periode(m.debut, m.fin) + ", au sein du gouvernement " + m.gouvernement + "."}
      </p>

      <h2>Cabinet ministériel</h2>
      {equipe.length === 0 ? (
        <p className="meta">
          Aucune nomination identifiée au JORF pour ce mandat — cabinet non documenté, pas nécessairement inexistant
          (le recensement est en cours pour les mandats récents).
        </p>
      ) : (
        <ul>
          {equipe.map((c) => (
            <li key={c.id}>
              <a href={"/gouvernement/c/" + encodeURIComponent(c.collab_cle)}>{prenomNom(c.collab_prenom, c.collab_nom)}</a>{" "}
              <span className="meta">— {c.fonction} · {periode(c.debut, c.fin)}</span>
            </li>
          ))}
        </ul>
      )}

      {mandats.length > 1 && (
        <>
          <h2>Tous les mandats de {nom}</h2>
          <ul className="gouvernement">
            {mandats.map((x) => (
              <li key={x.id}>
                {x.id === m.id ? (
                  <strong>{x.portefeuille || x.fonction}</strong>
                ) : (
                  <a href={"/gouvernement/m/" + encodeURIComponent(x.id)}>{x.portefeuille || x.fonction}</a>
                )}
                <span className="meta"> — {x.gouvernement} · {periode(x.debut, x.fin)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="meta" style={{ marginTop: 32 }}>
        Fiche établie d'après les nominations publiées au Journal officiel (DILA). Pour faire rectifier ou masquer une information :{" "}
        <a href="/contact?sujet=rgpd">formulaire de contact</a>.
      </p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: nom,
            jobTitle: m.portefeuille || m.fonction || "Ministre",
            url: "https://www.dataparl.fr/gouvernement/m/" + m.id,
          }),
        }}
      />
    </>
  );
}
