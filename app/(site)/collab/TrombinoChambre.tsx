import { CHAMBRE_LONG } from "@/lib/format";
import { dataQueryTout } from "@/lib/data";
import { CHAMBRE_COURTE } from "@/lib/collectifs";

// Trombinoscope des collaborateurs d'une chambre : la planche de tous les
// collaborateurs en poste, nom + élu employeur + fonction. L'intitulé reprend
// les mots des publications officielles (« Trombinoscope des collaborateurs
// de Sénateur », « Liste des collaborateurs par député ») pour figurer
// devant elles sur les mêmes requêtes.
type Periode = { collab_id: string; elu_id: string; elu_nom: string; fonction: string };
type Collab = { collab_id: string; nom: string; prenom: string };
const AU: Record<string, string> = { assemblee: "à l'Assemblée nationale", senat: "au Sénat", europarl: "au Parlement européen" };
const TITRE: Record<string, string> = {
  assemblee: "Trombinoscope des collaborateurs de député",
  senat: "Trombinoscope des collaborateurs de Sénateur",
  europarl: "Trombinoscope des collaborateurs de député européen",
};
const PAR: Record<string, string> = { assemblee: "par député", senat: "par sénateur", europarl: "par député européen" };

export default async function TrombinoChambre({ chambre }: { chambre: "assemblee" | "senat" | "europarl" }) {
  const seg = CHAMBRE_COURTE[chambre];
  const [rows, collabs] = await Promise.all([
    dataQueryTout<Periode>("periodes",
      new URLSearchParams({ select: "collab_id,elu_id,elu_nom,fonction", chambre: "eq." + chambre, en_cours: "eq.true", order: "elu_nom.asc" }),
      3600).catch((): Periode[] => []),
    dataQueryTout<Collab>("collaborateurs",
      new URLSearchParams({ select: "collab_id,nom,prenom" }),
      3600).catch((): Collab[] => []),
  ]);
  const noms = new Map(collabs.map((c) => [c.collab_id, [c.prenom, c.nom].filter(Boolean).join(" ")]));
  const maj = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const total = rows.length;

  return (
    <>
      <p className="meta"><a href={"/collab/" + seg}>&larr; Collaborateurs {CHAMBRE_LONG[chambre]}</a> · <a href="/collab">&larr; Tous les collaborateurs</a></p>
      <h1>{TITRE[chambre]}</h1>
      <p className="lead">
        {total.toLocaleString("fr-FR")} collaborateurs parlementaires en poste {AU[chambre]} : la planche complète,
        nom du collaborateur, élu employeur et fonction. Mise à jour quotidienne — page générée le {maj}.
      </p>
      {total === 0 ? (
        <p className="meta">Aucun collaborateur en poste enregistré pour cette chambre pour l&apos;instant.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "16px 0", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 8 }}>
          {rows.map((r) => (
            <li key={r.collab_id + "-" + r.elu_id} style={{ border: "1px solid #e3e3e3", borderRadius: 10, padding: "10px 12px" }}>
              <strong>{noms.get(r.collab_id) ?? "—"}</strong>
              <br />
              <span className="meta">{"Collaborateur de " + r.elu_nom}</span>
              {r.fonction ? (<><br /><span className="meta">{r.fonction}</span></>) : null}
            </li>
          ))}
        </ul>
      )}
      <p className="meta">
        {"Version tableau détaillée et exportable : "}
        <a href={"/collab/" + seg + "/liste"}>{"liste des collaborateurs " + PAR[chambre]}</a>
        {" · "}
        <a href="https://media.dataparl.fr/sheets/liste_collab_dataparl">DataParl&apos; Sheets</a>.
      </p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: TITRE[chambre],
            description: "Trombinoscope des collaborateurs parlementaires en poste " + AU[chambre] + " : nom, élu employeur et fonction, mis à jour quotidiennement.",
            url: "https://www.dataparl.fr/collab/" + seg + "/trombinoscope",
            creator: { "@type": "Organization", name: "DataParl'", url: "https://www.dataparl.fr" },
            isAccessibleForFree: true,
          }),
        }}
      />
    </>
  );
}
