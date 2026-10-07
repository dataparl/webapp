import type { Metadata } from "next";
import { authAdmin } from "@/lib/supabaseAdmin";
import ListeOffres, { type OffreListe } from "./_components/ListeOffres";
import FooterJobs from "./_components/FooterJobs";

// Offres d'emploi des équipes parlementaires — page publique.
// Lecture serveur uniquement (clé service jamais exposée) : seules les
// offres approuvées, actives et non expirées sont affichées.

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Offres d'emploi parlementaires | DataParl'",
  description:
    "Les offres d'emploi de collaborateur parlementaire : Assemblée nationale, Sénat, Parlement européen. Filtres par chambre, élu, groupe et département.",
  alternates: { canonical: "/jobs" },
};

// Petite carte statistique arrondie.
function Bulle({ icone, nombre, libelle }: { icone: string; nombre: number; libelle: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 2px 10px rgba(7,26,65,0.06)",
      }}
    >
      <p style={{ margin: "0 0 6px", fontSize: "1.3rem" }}>{icone}</p>
      <p style={{ margin: "0 0 2px", fontSize: "1.5rem", fontWeight: 800, color: "var(--ink)" }}>{nombre}</p>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>{libelle}</p>
    </div>
  );
}

export default async function Jobs() {
  let offres: OffreListe[] = [];
  try {
    const { data, error } = await authAdmin()
      .from("job_offers")
      .select(
        "id,titre,description,chambre,departement,elu_prenom,elu_nom,groupe_politique,type_poste,localisation,publie_le,expire_le,source_connector"
      )
      .eq("review_status", "approved")
      .eq("statut", "active")
      .order("publie_le", { ascending: false, nullsFirst: false })
      .limit(200);
    if (error) throw error;
    const aujourdhui = new Date().toISOString().slice(0, 10);
    offres = (data ?? []).filter((o) => !o.expire_le || o.expire_le >= aujourdhui) as OffreListe[];
  } catch {
    offres = [];
  }

  const elus = new Set(offres.map((o) => [o.elu_prenom, o.elu_nom].filter(Boolean).join(" ")).filter(Boolean));
  const departements = new Set(offres.map((o) => o.departement).filter(Boolean));
  const depuis7j = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const nouvelles = offres.filter((o) => o.publie_le && o.publie_le >= depuis7j).length;

  return (
    <>
      <h1>
        <span className="surligne">Offres d&apos;emploi</span> parlementaires
      </h1>
      <p className="lead">
        Les postes de collaborateur parlementaire publiés dans les équipes, collectés depuis les sources officielles et vérifiés à la main.
      </p>

      {/* ——— Bulles statistiques ——— */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 14,
          margin: "28px 0 0",
        }}
      >
        <Bulle icone="🏛️" nombre={offres.length} libelle="Offres actives" />
        <Bulle icone="🧑‍⚖️" nombre={elus.size} libelle="Élus concernés" />
        <Bulle icone="🗺️" nombre={departements.size} libelle="Départements" />
        <Bulle icone="✨" nombre={nouvelles} libelle="Nouvelles cette semaine" />
      </div>

      {/* ——— Carte d'appel : proposer une offre ——— */}
      <div
        style={{
          marginTop: 18,
          background: "#EEF2FB",
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: "18px 20px",
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>✉️ Vous avez une offre à publier ?</strong>
          <br />
          <span className="meta">
            Déposez-la depuis votre adresse parlementaire — chaque offre est relue avant publication.
          </span>
        </p>
        <a className="btn" href="/jobs/proposer">Proposer une offre</a>
      </div>

      {offres.length === 0 ? (
        <p style={{ marginTop: "32px" }}>
          Aucune offre active pour le moment — les nouvelles publications apparaissent ici dès leur validation.
        </p>
      ) : (
        <ListeOffres offres={offres} />
      )}

      <p className="meta" style={{ marginTop: "28px" }}>
        Les offres pourvues ou expirées restent consultables dans les{" "}
        <a href="/jobs/old-jobs">anciennes offres</a>.
      </p>

      <FooterJobs />
    </>
  );
}
