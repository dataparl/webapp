import { idParlementaire } from "@/lib/format";
import type { StatElu } from "@/lib/stats";

type Colonne = { titre: string; num?: boolean; valeur: (r: StatElu) => React.ReactNode };

// Tableau par élu, avec lien vers la fiche.
export default function TableauElus({ lignes, colonnes }: { lignes: StatElu[]; colonnes: Colonne[] }) {
  return (
    <div className="defile">
      <table className="stats">
        <thead>
          <tr>
            <th>Élu</th>
            <th>Groupe</th>
            {colonnes.map((c) => <th key={c.titre} className={c.num ? "num" : undefined}>{c.titre}</th>)}
          </tr>
        </thead>
        <tbody>
          {lignes.map((r) => (
            <tr key={`${r.chambre}-${r.elu_cle}`}>
              <td><a href={`/parlementaires/${encodeURIComponent(idParlementaire(r.chambre, r.elu_id, r.elu_cle, r.elu_nom))}`}>{r.elu_nom}</a></td>
              <td>{r.elu_groupe}</td>
              {colonnes.map((c) => <td key={c.titre} className={c.num ? "num" : undefined}>{c.valeur(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
