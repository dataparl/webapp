import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Photo from "@/app/_components/Photo";
import { prenomNom } from "@/lib/format";
import { listeGouvernements, mandatsEtCabinets, photosDesPersonnes, type PhotoMinistre } from "@/lib/gouvernement";
import {
  ORDRE_FONCTION, categorieFonction, finEffective, libelleRang, periode, slugMinistre,
  type MembreCabinet,
} from "@/lib/gouvernementTypes";

export const revalidate = 3600;
type Props = { params: Promise<{ gouv: string; ministre: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gouv, ministre } = await params;
  const gouvSlug = decodeURIComponent(gouv).toLowerCase();
  const cible = decodeURIComponent(ministre).toLowerCase();
  let m: { prenom: string; nom: string; portefeuille: string; fonction: string } | null = null;
  try {
    const { mandats } = await mandatsEtCabinets();
    const g = listeGouvernements(mandats).find((x) => x.slug === gouvSlug);
    if (g) {
      m = mandats.find((x) => x.gouvernement === g.nom && slugMinistre(x.prenom, x.nom).toLowerCase() === cible) ?? null;
    }
  } catch {
    m = null;
  }
  if (!m) return {};
  const nom = prenomNom(m.prenom, m.nom);
  return {
    title: nom + " : son cabinet ministériel (gouvernement)",
    description:
      "Membres du cabinet de " + nom + ", " + (m.portefeuille || m.fonction) + " — directeurs, chefs de cabinet, conseillers — d'après le Journal officiel.",
    alternates: { canonical: "/gouvernement/" + gouvSlug + "/collabs/" + encodeURIComponent(slugMinistre(m.prenom, m.nom)) },
  };
}

export default async function CabinetMinistre({ params }: Props) {
  const gouvSlug = decodeURIComponent((await params).gouv).toLowerCase();
  const cible = decodeURIComponent((await params).ministre).toLowerCase();
  const { mandats, cabinets } = await mandatsEtCabinets();
  const g = listeGouvernements(mandats).find((x) => x.slug === gouvSlug);
  if (!g) notFound();
  const mandatsMinistre = mandats
    .filter((m) => m.gouvernement === g.nom && slugMinistre(m.prenom, m.nom).toLowerCase() === cible)
    .sort((a, b) => a.debut.localeCompare(b.debut));
  if (!mandatsMinistre.length) notFound();
  const principal = mandatsMinistre[mandatsMinistre.length - 1];
  const nom = prenomNom(principal.prenom, principal.nom);
  const photos = await photosDesPersonnes(mandatsMinistre.map((m) => m.personne_id ?? ""));
  const photo = mandatsMinistre
    .map((m) => (m.personne_id ? photos.get(m.personne_id) : undefined))
    .find((p): p is PhotoMinistre => !!p);

  const cabinetsParMinistre = new Map<string, MembreCabinet[]>();
  for (const c of cabinets) {
    const l = cabinetsParMinistre.get(c.ministre_id) ?? [];
    l.push(c);
    cabinetsParMinistre.set(c.ministre_id, l);
  }

  return (
    <>
      <p className="meta" style={{ marginBottom: 0 }}>
        <a href={"/gouvernement/" + gouvSlug}>Gouvernement {g.nom}</a>
        {" · "}<a href={"/gouvernement/m/" + encodeURIComponent(principal.id)}>fiche complète de {nom}</a>
      </p>
      <div className="entete-elu">
        <Photo chambre={photo?.chambre} slug={photo?.slug} src={photo?.photo_url} nom={nom} />
        <div>
          <h1 style={{ margin: "2px 0 6px" }}>{nom}</h1>
          <p className="lead" style={{ margin: 0 }}>
            {principal.portefeuille || principal.fonction} · {libelleRang(principal.rang)} · {periode(principal.debut, principal.fin)}
          </p>
        </div>
      </div>

      {mandatsMinistre.map((m) => {
        const equipe = [...(cabinetsParMinistre.get(m.id) ?? [])].sort(
          (a, b) =>
            ORDRE_FONCTION[categorieFonction(a.fonction)] - ORDRE_FONCTION[categorieFonction(b.fonction)] ||
            a.collab_nom.localeCompare(b.collab_nom, "fr"),
        );
        return (
          <section key={m.id}>
            <h2>
              {m.portefeuille || m.fonction} <span className="meta">· {periode(m.debut, m.fin)}</span>
            </h2>
            {equipe.length === 0 ? (
              <p className="meta">
                Aucune nomination identifiée au JORF pour ce mandat — cabinet non documenté ici, pas nécessairement inexistant.
              </p>
            ) : (
              <ul>
                {equipe.map((c) => (
                  <li key={c.id}>
                    <a href={"/gouvernement/c/" + encodeURIComponent(c.collab_cle)}>{prenomNom(c.collab_prenom, c.collab_nom)}</a>{" "}
                    <span className="meta">— {c.fonction} · {periode(c.debut, finEffective(c.fin, m.fin))}{c.collab_id ? " · aussi collaborateur parlementaire" : ""}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <p className="meta" style={{ marginTop: 32 }}>
        Membres du cabinet tels que publiés au Journal officiel (DILA). Pour faire rectifier ou masquer une information :{" "}
        <a href="/contact?sujet=rgpd">formulaire de contact</a>.
      </p>
    </>
  );
}
