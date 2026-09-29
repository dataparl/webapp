import { compteAffectations, derniersMouvements, type Mouvement } from "@/lib/data";

export const revalidate = 300;

const CHAMBRE: Record<Mouvement["chambre"], string> = { assemblee: "Assemblée", senat: "Sénat", europarl: "Parlement européen" };
const TYPE: Record<Mouvement["type"], string> = { arrivee: "Arrivée", depart: "Départ", transfert: "Transfert" };

function phrase(m: Mouvement): string {
  const qui = `${m.collab_prenom} ${m.collab_nom}`.trim();
  const elu = `${m.elu_nom}${m.elu_groupe ? ` (${m.elu_groupe})` : ""}`;
  if (m.type === "arrivee") return `${qui} rejoint l'équipe de ${elu}`;
  if (m.type === "depart") return `${qui} quitte l'équipe de ${elu}`;
  return `${qui} passe de ${m.elu_origine_nom} à ${elu}`;
}

export default async function Accueil() {
  let mouvements: Mouvement[] = [];
  let comptes: Record<string, number> = {};
  let indisponible = false;
  try {
    [mouvements, comptes] = await Promise.all([derniersMouvements(40), compteAffectations()]);
  } catch {
    indisponible = true;
  }
  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

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

      <h2>Derniers mouvements</h2>
      {indisponible && <p className="erreur">Les données sont momentanément indisponibles.</p>}
      {!indisponible && mouvements.length === 0 && (
        <p className="meta">Aucun mouvement détecté depuis le démarrage du suivi. Les premiers apparaîtront ici dès le prochain passage du bot.</p>
      )}
      <ul className="mouvements">
        {mouvements.map((m) => (
          <li key={m.id}>
            <span className={`badge ${m.type}`}>{TYPE[m.type]}</span>
            <div>
              {phrase(m)}
              <div className="meta">{CHAMBRE[m.chambre]} · {fmt.format(new Date(m.date_event))}</div>
            </div>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 32 }}><a className="btn" href="/alertes">Recevoir les alertes par email</a></p>
    </>
  );
}
