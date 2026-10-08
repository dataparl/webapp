import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CHAMBRE_LONG, prenomNom } from "@/lib/format";
import { libellePeriode, moisAnnee } from "@/lib/periodes";
import { collaborateurDepuisSlug, parlementaireDepuisId, parlementairesParElu, periodesCollab } from "@/lib/referentiel";
import { nomAffiche } from "@/lib/format";
import ParcoursCollab from "./ParcoursCollab";
import PubGoogle from "@/app/_components/PubGoogle";

export const revalidate = 3600;
type Props = { params: Promise<{ slug: string }> };

// Fiches collaborateurs indexables : listes officielles publiques (AN, Senat).
export async function generateMetadata({ params }: { slug: string }): Promise<Metadata> {
  const c = await collaborateurDepuisSlug((await params).slug).catch(() => null);
  if (!c) return { title: "Collaborateur" };
  const nom = prenomNom(c.prenom, c.nom);
  return {
    title: nom + " : parcours de collaborateur parlementaire",
    description: "Parcours de " + nom + " : postes de collaborateur parlementaire (fonction, élu, chambre, périodes), d'après les listes officielles de l'Assemblée nationale et du Sénat.",
    alternates: { canonical: "/collab/" + c.slug },
  };
}

export default async function FicheCollab({ params }: Props) {
  const { slug } = await params;
  const c = await collaborateurDepuisSlug(slug).catch(() => null);
  if (!c) notFound();
  const periodes = await periodesCollab(c.collab_id);
  const actuelles = periodes.filter((p) => p.en_cours);
  const [fiches, commeElu] = await Promise.all([
    parlementairesParElu(actuelles).catch(() => []),
    c.parlementaire_slug ? parlementaireDepuisId(c.parlementaire_slug).catch(() => null) : Promise.resolve(null),
  ]);
  const nom = prenomNom(c.prenom, c.nom);
  const role = c.genre === "F" ? "Collaboratrice parlementaire" : c.genre === "H" ? "Collaborateur parlementaire" : "Collaborateur(rice) parlementaire";

  return (
    <>
      <p className="meta" style={{ marginBottom: 0 }}>{role} · {c.chambres.split(" ").map((x) => CHAMBRE_LONG[x]).join(", ")}</p>
      <h1>{nom}</h1>
      <p className="lead">
        {c.actif ? "En poste aujourd'hui." : `Dernière présence connue : ${moisAnnee(c.derniere_date)}.`}{" "}
        {c.n_elus > 1 ? `A travaillé pour ${c.n_elus} élus` :
 "A travaillé pour 1 élu"}
        {c.premiere_date ?
 ` depuis ${c.premiere_date.slice(0, 4)}` : ""}.
      </p>

      {commeElu && (
        <p className="card" style={{ maxWidth: "none" }}>
          {nom} a aussi été {commeElu.actif ? "élu(e)" : "parlementaire"} :{" "}
          <a href={`/parlementaires/${encodeURIComponent(commeElu.slug)}`}>
            {commeElu.chambre === "senat" ? (commeElu.civilite === "Mme" ? "sénatrice" : "sénateur") : commeElu.chambre === "europarl" ? (commeElu.civilite === "Mme" ? "députée européenne" : "député européen") : (commeElu.civilite === "Mme" ? "députée" : "député")}
            {commeElu.circonscription && commeElu.chambre !== "europarl" ? ` (${commeElu.circonscription})` : ""}
          </a>
          {commeElu.actif ? ", en fonction" : commeElu.fin_mandat ? `, jusqu'en ${commeElu.fin_mandat.slice(0, 4)}` : ""}.
          <span className="meta"> Rapprochement par le nom, sans chevauchement entre ses mandats et ses postes de collaborateur.</span>
        </p>
      )}

      {actuelles.length > 0 && (
        <>
          <h2>Aujourd&apos;hui</h2>
          <ul className="organes">
            {actuelles.map((p, i) => {
              const f = fiches.find((x) => x.chambre === p.chambre && x.elu_id === p.elu_id);
              const eluNom = f ? prenomNom(f.prenom, f.nom) : nomAffiche(p.elu_nom);
              return (
                <li key={i}>
                  {p.fonction || (c.genre === "F" ? "Collaboratrice" : "Collaborateur")} de{" "}
                  {f ? <a href={`/parlementaires/${encodeURIComponent(f.slug)}`}>{eluNom}</a> : eluNom}
                  <span className="meta"> · {CHAMBRE_LONG[p.chambre]}{f?.groupe ? ` · ${f.groupe}` : ""} · {libellePeriode(p)}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <h2>Parcours</h2>
      <ParcoursCollab id={c.collab_id} suite={`/collab/${c.slug}`} />

      {/* Annonce display AdSense : après le contenu, avant les fiches liées.
          Aucun espace réservé tant que NEXT_PUBLIC_ADSENSE_SLOT n’est pas défini. */}
      <PubGoogle />

      <p className="meta" style={{ marginTop: 32 }}>
        Fiche établie d&apos;après les listes officielles de collaborateurs publiées par l&apos;Assemblée nationale et le Sénat.
        Deux personnes homonymes peuvent être confondues. Pour faire rectifier ou masquer une information :{" "}
        <a href="/contact?sujet=rgpd">formulaire de contact</a>.
      </p>
    </>
  );
}
