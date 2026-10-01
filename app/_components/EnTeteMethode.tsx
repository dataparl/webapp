import { dateTitre } from "@/lib/daily";

// Bandeau de version et pied de licence des pages de méthode.
export function VersionMethode({ donnees, historique }: { donnees: string | null; historique: { date: string; texte: string }[] }) {
  const v = historique[historique.length - 1]?.date;
  return (
    <p className="version-methode">
      Méthode applicable aux données {donnees ? `du ${dateTitre(donnees)}` : "actuelles"}
      {v ? ` · version du ${dateTitre(v)}` : ""}. Toute évolution de méthode est datée et décrite <a href="#historique">en bas de page</a>.
    </p>
  );
}

export function PiedMethode({ historique, csv }: { historique: { date: string; texte: string }[]; csv: string }) {
  return (
    <>
      <h2 id="donnees">Données brutes</h2>
      <p>
        La table annuelle ci-dessus est téléchargeable en CSV : <a href={csv} download>{csv.split("/").pop()}</a>.
        Elle est diffusée, comme la base DataParl&apos;, sous licence <a href="https://opendatacommons.org/licenses/odbl/1-0/">ODbL 1.0</a> :
        citez « DataParl&apos; (dataparl.fr), d&apos;après les publications officielles de l&apos;Assemblée nationale et du Sénat » et la date des données.
      </p>
      <p className="meta">
        Sources : listes officielles des collaborateurs publiées par l&apos;Assemblée nationale et le Sénat (Licence Ouverte 2.0),
        relevées chaque matin ; archives depuis 2015. Détails : <a href="/informations-legales/licences">licences et réutilisation</a>.
      </p>
      <h2 id="historique">Historique de la méthode</h2>
      <ul>{historique.map((h) => <li key={h.date}><strong>{dateTitre(h.date)}</strong> : {h.texte}</li>)}</ul>
    </>
  );
}
