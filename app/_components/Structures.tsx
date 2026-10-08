import Link from "next/link";
import type { InfoSiren, Structure } from "@/lib/structures";

// Tableau d'une liste de structures (tiers payants ou prestataires).
// hrefBase : préfixe des fiches détail (/collab/tiers-payants, /collab/prestataires).
export function TableStructures({
  liste,
  siren,
  hrefBase,
}: {
  liste: Structure[];
  siren: Record<string, InfoSiren | null>;
  hrefBase: string;
}) {
  if (liste.length === 0) {
    return <p className="meta">Aucune structure dans cette catégorie pour les eurodéputés français suivis.</p>;
  }
  const avecSiren = Object.values(siren).some(Boolean);
  return (
    <table className="stats">
      <thead>
        <tr>
          <th>Structure</th>
          <th>Eurodéputés clients</th>
          {avecSiren && <th>Forme juridique</th>}
          {avecSiren && <th>SIREN</th>}
        </tr>
      </thead>
      <tbody>
        {liste.map((s) => {
          const info = siren[s.cle];
          return (
            <tr key={s.cle}>
              <td>
                <Link href={`${hrefBase}#${s.cle}`}>{s.nom}</Link>
              </td>
              <td>{s.clients.length}</td>
              {avecSiren && <td>{info?.forme_juridique || "—"}</td>}
              {avecSiren && <td>{info?.siren || "non identifiée"}</td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// Carte d'identité SIREN d'une structure (si enrichissement réussi).
export function CarteSiren({ info }: { info: InfoSiren | null }) {
  if (!info) {
    return (
      <p className="meta">
        Structure non identifiée au registre national des entreprises. L'enrichissement automatique (SIREN, forme
        juridique, dirigeants) s'appuie sur les dénominations publiées par le Parlement européen, qui peuvent
        différer de la raison sociale officielle.
      </p>
    );
  }
  return (
    <div className="card" style={{ maxWidth: "none" }}>
      <p style={{ margin: "0 0 6px" }}>
        <strong>{info.denomination}</strong>
        {info.actif ? <span className="puce">société active</span> : null}
      </p>
      <p className="meta" style={{ margin: 0 }}>
        {info.forme_juridique} · SIREN {info.siren}
        {info.adresse ? ` · ${info.adresse}` : ""}
      </p>
      {info.dirigeants.length > 0 && (
        <p className="meta" style={{ margin: "6px 0 0" }}>
          Dirigeants : {info.dirigeants.join(", ")}
        </p>
      )}
      <p className="meta" style={{ margin: "6px 0 0" }}>
        Source : registre des entreprises via Pappers — dénomination PE rapprochée automatiquement, à vérifier en cas
        d'homonymie.
      </p>
    </div>
  );
}
