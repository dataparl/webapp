import { CHAMBRE, TYPE, dateLongue, idParlementaire, phrase, type MouvementAffiche } from "@/lib/format";

export default function ListeMouvements({ mouvements }: { mouvements: MouvementAffiche[] }) {
  return (
    <ul className="mouvements">
      {mouvements.map((m) => (
        <li key={m.id}>
          <span className={`badge ${m.type}`}>{TYPE[m.type]}</span>
          <div>
            {phrase(m)}
            <div className="meta">
              {CHAMBRE[m.chambre]} · {dateLongue(m.date_event)}
              {m.fonction ? ` · ${m.fonction}` : ""}
              {" · "}
              <a href={`/parlementaires/${encodeURIComponent(idParlementaire(m.chambre, m.elu_id, m.elu_cle, m.elu_nom))}`}>fiche de l&apos;élu</a>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
