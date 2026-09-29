import ListeMouvements from "../_components/ListeMouvements";
import { compteAffectations, derniersMouvements, type Mouvement } from "@/lib/data";

export const revalidate = 300;

export default async function Accueil() {
  let mouvements: Mouvement[] = [];
  let comptes: Record<string, number> = {};
  let indisponible = false;
  try {
    [mouvements, comptes] = await Promise.all([derniersMouvements(10), compteAffectations()]);
  } catch {
    indisponible = true;
  }

  return (
    <>
      <h1>Qui travaille pour <span className="surligne">vos élus</span> ?</h1>
      <p className="lead">
        Chaque matin, DataParl&apos; relit les listes officielles des collaborateurs parlementaires et signale
        les arrivées, les départs et les transferts.
      </p>

      <div className="chiffres">
        <div><strong>{(comptes.assemblee ?? 0).toLocaleString("fr-FR")}</strong><span>collaborateurs à l&apos;Assemblée</span></div>
        <div><strong>{(comptes.senat ?? 0).toLocaleString("fr-FR")}</strong><span>collaborateurs au Sénat</span></div>
      </div>

      <h2>Les derniers mouvements</h2>
      {indisponible && <p className="erreur">Les données sont momentanément indisponibles.</p>}
      {!indisponible && mouvements.length === 0 && (
        <p className="meta">Aucun mouvement détecté depuis le démarrage du suivi quotidien. Les premiers apparaîtront ici dès le prochain passage.</p>
      )}
      <ListeMouvements mouvements={mouvements} />

      <div className="card" style={{ maxWidth: "none", marginTop: 28 }}>
        <p style={{ marginTop: 0 }}>
          <strong>Tout l&apos;historique depuis 2015</strong>, la recherche par collaborateur, élu, groupe ou date, et les
          alertes personnalisées : c&apos;est gratuit, il suffit d&apos;un compte.
        </p>
        <a className="btn" href="/mouvements">Voir plus</a>
      </div>

      <h2>Explorer</h2>
      <ul className="sommaire">
        <li><a href="/mouvements/parlement"><strong>Mouvements</strong><span>Rechercher dans les trois chambres →</span></a></li>
        <li><a href="/collabs"><strong>Collaborateurs</strong><span>Qui travaille pour quel élu, et comment le joindre →</span></a></li>
        <li><a href="/alertes"><strong>Alertes</strong><span>Être prévenu(e) des mouvements qui t&apos;intéressent →</span></a></li>
      </ul>
    </>
  );
}
