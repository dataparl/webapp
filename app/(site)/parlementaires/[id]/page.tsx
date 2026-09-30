import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ListeMouvements from "@/app/_components/ListeMouvements";
import Photo from "@/app/_components/Photo";
import { eluDepuisFiche, eluDepuisId, equipe, lienOfficiel, mouvementsElu, statsElu } from "@/lib/elus";
import { familleDe } from "@/lib/familles";
import { CHAMBRE_LONG, nomAffiche, prenomNom } from "@/lib/format";
import { chevauche, fusionner, libellePeriode, moisAnnee } from "@/lib/periodes";
import { parlementaireDepuisId, periodesElu, personne, type Appartenance, type Mandat, type Parlementaire } from "@/lib/referentiel";
import { partFemmes, pct, tauxTurnover } from "@/lib/stats";

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = decodeURIComponent((await params).id);
  const f = await parlementaireDepuisId(id).catch(() => null);
  if (f) {
    const nom = prenomNom(f.prenom, f.nom);
    return { title: `${nom} : équipe et parcours`, description: `Les collaborateurs de ${nom} (${CHAMBRE_LONG[f.chambre]}), leurs mouvements, ses mandats et ses commissions.` };
  }
  const e = await eluDepuisId(id).catch(() => null);
  return e ? { title: `${nomAffiche(e.nom)} : son équipe` } : { title: "Parlementaire" };
}

const TITRE: Record<string, [string, string]> = {
  assemblee: ["Député", "Députée"], senat: ["Sénateur", "Sénatrice"], europarl: ["Député européen", "Députée européenne"],
};
const titre = (f: Pick<Parlementaire, "chambre" | "civilite">) => TITRE[f.chambre][f.civilite === "Mme" ? 1 : 0];
const ancien = (f: Pick<Parlementaire, "civilite">) => (f.civilite === "Mme" ? "Ancienne" : "Ancien");

function Groupe({ chambre, sigle, libelle }: { chambre: string; sigle: string; libelle?: string }) {
  if (!sigle) return null;
  const fam = familleDe(chambre, sigle);
  return (
    <span title={libelle || undefined}>
      Groupe {sigle}{fam && fam.code !== sigle ? <span className="meta"> (famille {fam.code})</span> : null}
    </span>
  );
}

function ListeOrganes({ items }: { items: Appartenance[] }) {
  if (!items.length) return null;
  return (
    <ul className="organes">
      {items.map((a, i) => (
        <li key={`${a.code}-${a.debut}-${i}`}>
          {a.libelle}
          {a.fonction && a.fonction.toLowerCase() !== "membre" && <span className="puce">{a.fonction}</span>}
          <span className="meta"> · {a.fin ? `${moisAnnee(a.debut)} à ${moisAnnee(a.fin)}` : `depuis ${moisAnnee(a.debut)}`}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function Parlementaire({ params }: Props) {
  const id = decodeURIComponent((await params).id);
  const f = await parlementaireDepuisId(id).catch(() => null);
  if (!f) return <FicheSimple id={id} />;

  const { fiches, mandats, appartenances } = await personne(f.personne_id);
  const e = eluDepuisFiche(f);
  const [collabs, mouvements, stats, periodes] = await Promise.all([
    f.actif && f.chambre !== "europarl" ? equipe(e) : Promise.resolve([]),
    mouvementsElu(e, 5).catch(() => []),
    f.actif ? statsElu(e).catch(() => null) : Promise.resolve(null),
    periodesElu(fiches).catch(() => []),
  ]);
  const nom = prenomNom(f.prenom, f.nom);
  const nbCollabs = new Set(periodes.map((p) => p.collab_id)).size;
  const depuis = periodes.map((p) => p.debut).filter(Boolean).sort()[0];
  const commissionsActuelles = fusionner(appartenances.filter((a) => a.chambre === f.chambre && a.elu_id === f.elu_id && a.type !== "groupe")).filter((a) => !a.fin);
  const autres = fiches.filter((x) => x.chambre !== f.chambre);

  return (
    <>
      <div className="entete-elu">
        <Photo src={f.photo_url} nom={nom} />
        <div>
          <p className="meta" style={{ margin: 0 }}>{CHAMBRE_LONG[f.chambre]}{f.actif ? "" : ` · ${ancien(f).toLowerCase()} mandat`}</p>
          <h1 style={{ margin: "2px 0 6px" }}>{nom}</h1>
          <p className="lead" style={{ margin: 0 }}>
            {f.actif ? titre(f) : `${ancien(f)} ${titre(f).toLowerCase()}`}
            {f.circonscription && f.chambre !== "europarl" ? ` · ${f.circonscription}` : ""}
            {f.actif && f.groupe ? <> · <Groupe chambre={f.chambre} sigle={f.groupe} libelle={f.groupe_libelle} /></> : null}
          </p>
          <p className="meta" style={{ marginTop: 6 }}>
            {f.actif ? `En fonction depuis ${moisAnnee(dernierDebut(mandats, f))}` : f.fin_mandat ? `Mandat terminé en ${moisAnnee(f.fin_mandat)}` : ""}
            {f.url_officielle && <> · <a href={f.url_officielle}>fiche officielle</a></>}
            {autres.map((x) => <span key={x.chambre}> · <a href={`/parlementaires/${encodeURIComponent(x.slug)}`}>fiche {CHAMBRE_LONG[x.chambre]}</a></span>)}
          </p>
        </div>
      </div>

      <div className="chiffres">
        {stats && <>
          <div>
            <strong style={{ color: "var(--vigi)" }}>{pct(tauxTurnover(stats))}</strong>
            <span><a href="/vigiparl">VigiParl&apos;</a> · renouvellement sur 12 mois ({stats.departs_12m} départ{stats.departs_12m > 1 ? "s" : ""})</span>
          </div>
          <div>
            <strong style={{ color: "var(--mixi)" }}>{pct(partFemmes(stats))}</strong>
            <span><a href="/mixiparl">MixiParl&apos;</a> · de femmes ({stats.femmes} F, {stats.hommes} H{stats.indetermines ? `, ${stats.indetermines} ind.` : ""})</span>
          </div>
        </>}
        {nbCollabs > 0 && (
          <div>
            <strong>{nbCollabs}</strong>
            <span><a href={`/parlementaires/${encodeURIComponent(f.slug)}/historique`}>collaborateurs{depuis ? ` depuis ${depuis.slice(0, 4)}` : ""}</a>, toutes chambres</span>
          </div>
        )}
      </div>

      {commissionsActuelles.length > 0 && (
        <>
          <h2>Commissions et délégations</h2>
          <ListeOrganes items={commissionsActuelles} />
        </>
      )}

      {f.actif && f.chambre === "europarl" && (
        <p className="meta">Le suivi des assistants parlementaires européens est en pause : le site du Parlement européen bloque aujourd&apos;hui la lecture automatique de ses listes.</p>
      )}
      {f.actif && f.chambre !== "europarl" && (
        <>
          <h2>L&apos;équipe aujourd&apos;hui</h2>
          {collabs.length === 0 ? (
            <p className="meta">Aucun collaborateur dans la dernière publication officielle.</p>
          ) : (
            <table className="stats">
              <thead><tr><th>Collaborateur</th><th>Fonction</th></tr></thead>
              <tbody>
                {collabs.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <a href={`/collab/k/${encodeURIComponent(c.collab_cle)}`}>{prenomNom(c.collab_prenom, c.collab_nom)}</a>
                      {c.statut === "conge_sans_solde" && <span className="meta"> (congé)</span>}
                    </td>
                    <td>{c.fonction || "Collaborateur"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p>
            <a className="btn secondaire" href={`/collab?elu=${encodeURIComponent(f.slug)}`}>Contacts et export de l&apos;équipe</a>{" "}
            <a className="btn secondaire" href={`/parlementaires/${encodeURIComponent(f.slug)}/historique`}>Historique des collaborateurs</a>
          </p>
        </>
      )}
      {!f.actif && nbCollabs > 0 && (
        <p><a className="btn secondaire" href={`/parlementaires/${encodeURIComponent(f.slug)}/historique`}>Historique des collaborateurs</a></p>
      )}

      <h2>Parcours parlementaire</h2>
      <ol className="parcours">
        {mandats.map((m, i) => {
          const pendant = appartenances.filter((a) => a.chambre === m.chambre && chevauche(a, m, 7) && (!m.elu_id || a.elu_id === m.elu_id));
          const groupes = successifs(pendant.filter((a) => a.type === "groupe"));
          // Hors mandat en cours, on écarte les passages de moins de 15 jours (suppléances).
          const organes = fusionner(pendant.filter((a) => a.type !== "groupe")).filter((a) => !m.fin || !a.fin || chevauche(a, a, 15));
          const fiche = fiches.find((x) => x.chambre === m.chambre);
          return (
            <li key={`${m.chambre}-${m.debut}-${i}`}>
              <p className="parcours-titre">
                <strong>{m.libelle}</strong>
                {m.circonscription && m.chambre !== "europarl" ? ` · ${m.circonscription}` : ""}
                <span className="meta"> · {periodeMandat(m)}</span>
                {fiche && fiche.slug !== f.slug && <> · <a href={`/parlementaires/${encodeURIComponent(fiche.slug)}`}>voir la fiche</a></>}
              </p>
              {groupes.length > 0 && (
                <p className="meta" style={{ margin: "2px 0" }}>
                  {groupes.map((g, j) => <span key={j}>{j ? " puis " : "Groupe "}{g}</span>)}
                </p>
              )}
              {organes.length > 0 && (
                <details open={!m.fin}>
                  <summary>{organes.length} commission{organes.length > 1 ? "s" : ""} et délégation{organes.length > 1 ? "s" : ""}</summary>
                  <ListeOrganes items={organes} />
                </details>
              )}
            </li>
          );
        })}
      </ol>
      {mandats.length === 0 && <p className="meta">Mandats non disponibles.</p>}

      <h2>Derniers mouvements</h2>
      {mouvements.length === 0 ? <p className="meta">Aucun mouvement enregistré.</p> : <ListeMouvements mouvements={mouvements} />}
      <p><a href="/mouvements">Tout l&apos;historique (compte gratuit)</a></p>
    </>
  );
}

function dernierDebut(mandats: Mandat[], f: Parlementaire): string {
  const m = mandats.filter((x) => x.chambre === f.chambre && !x.fin).sort((a, b) => a.debut.localeCompare(b.debut));
  // Mandats successifs sans interruption (renouvellements) : on remonte au premier.
  const tous = mandats.filter((x) => x.chambre === f.chambre).sort((a, b) => b.debut.localeCompare(a.debut));
  let debut = m[0]?.debut ?? f.premier_mandat;
  for (const x of tous) if (x.fin && debut && Math.abs(new Date(debut).getTime() - new Date(x.fin).getTime()) < 5 * 86400_000) debut = x.debut;
  return debut;
}

// Groupes successifs dans l'ordre chronologique, sans répétition consécutive.
function successifs(groupes: Appartenance[]): string[] {
  const out: string[] = [];
  for (const g of [...groupes].sort((a, b) => a.debut.localeCompare(b.debut))) {
    const s = g.sigle || g.libelle;
    if (s && out[out.length - 1] !== s) out.push(s);
  }
  return out;
}

function periodeMandat(m: Mandat): string {
  return libellePeriode({ debut: m.debut, debut_connu: true, fin: m.fin, fin_connue: !!m.fin, en_cours: !m.fin });
}

// Élu absent du référentiel (cas rare) : fiche réduite d'après les données de collaborateurs.
async function FicheSimple({ id }: { id: string }) {
  const e = await eluDepuisId(id).catch(() => null);
  if (!e) notFound();
  const [collabs, mouvements] = await Promise.all([equipe(e), mouvementsElu(e, 5)]);
  const officiel = lienOfficiel(e);
  return (
    <>
      <p className="meta">{CHAMBRE_LONG[e.chambre]}</p>
      <h1>{nomAffiche(e.nom)}</h1>
      <p className="lead">{e.groupe ? `Groupe ${e.groupe}. ` : ""}{officiel && <a href={officiel}>Fiche officielle</a>}</p>
      <h2>L&apos;équipe</h2>
      <table className="stats">
        <tbody>{collabs.map((c, i) => <tr key={i}><td>{prenomNom(c.collab_prenom, c.collab_nom)}</td><td>{c.fonction || "Collaborateur"}</td></tr>)}</tbody>
      </table>
      <h2>Derniers mouvements</h2>
      <ListeMouvements mouvements={mouvements} />
    </>
  );
}
