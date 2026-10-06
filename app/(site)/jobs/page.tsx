import type { Metadata } from "next";
import Link from "next/link";
import { authAdmin } from "@/lib/supabaseAdmin";
import ListeOffres, { type OffreListe } from "./_components/ListeOffres";

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

  return (
    <>
      <h1>
        <span className="surligne">Offres d&apos;emploi</span> parlementaires
      </h1>
      <p className="lead">
        Les postes de collaborateur parlementaire publiés dans les équipes, collectés depuis les sources officielles et vérifiés à la main.
      </p>
      <p style={{ marginTop: "16px" }}>
        <a className="btn" href="/jobs/proposer">Proposer une offre</a>{" "}
        <span className="meta">réservé aux adresses parlementaires</span>
      </p>
      {offres.length === 0 ? (
        <p style={{ marginTop: "32px" }}>
          Aucune offre active pour le moment — les nouvelles publications apparaissent ici dès leur validation.
        </p>
      ) : (
        <ListeOffres offres={offres} />
      )}
    </>
  );
}
