import type { Metadata } from "next";
import { authAdmin } from "@/lib/supabaseAdmin";

// Offres d'emploi des équipes parlementaires — page publique.
// Côté serveur uniquement (authAdmin, clé service jamais exposée) :
// seules les offres approuvées et actives sont affichées ; les offres
// en revue, rejetées, expirées ou pourvues restent invisibles.

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Offres d'emploi | DataParl'",
  description: "Les offres d'emploi publiées dans les équipes parlementaires : postes de collaborateurs parlementaires, circonscriptions et groupes.",
  alternates: { canonical: "/jobs" },
};

type Offre = {
  id: string;
  titre: string;
  description: string;
  type_poste: string | null;
  localisation: string | null;
  groupe_politique: string | null;
  parlementaire_slug: string | null;
  source_url: string | null;
  publie_le: string | null;
  expire_le: string | null;
};

const dateFr = (iso: string | null) =>
  iso ? new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null;

export default async function Jobs() {
  // job_offers vit dans la base auth (même client que la route admin),
  // lue ici côté serveur avec la clé service : rien n'est exposé au navigateur.
  let visibles: Offre[] = [];
  try {
    const { data, error } = await authAdmin()
      .from("job_offers")
      .select("id,titre,description,type_poste,localisation,groupe_politique,parlementaire_slug,source_url,publie_le,expire_le")
      .eq("review_status", "approved")
      .eq("statut", "active")
      .order("publie_le", { ascending: false, nullsFirst: false })
      .limit(100);
    if (error) throw error;
    const aujourdhui = new Date().toISOString().slice(0, 10);
    visibles = (data ?? []).filter((o) => !o.expire_le || o.expire_le >= aujourdhui);
  } catch {
    visibles = [];
  }

  return (
    <>
      <h1>Offres d<span className="surligne">'</span>emploi parlementaires</h1>
      <p className="lead">
        Les postes de collaborateur parlementaire publiés dans les équipes, collectés depuis les sources officielles.
      </p>

      {visibles.length === 0 ? (
        <p style={{ marginTop: "32px" }}>
          Aucune offre active pour le moment — les nouvelles publications apparaissent ici dès leur validation.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "16px", marginTop: "32px" }}>
          {visibles.map((o) => (
            <li key={o.id} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
              <h2 style={{ margin: "0 0 8px", fontSize: "1.15rem" }}>{o.titre}</h2>
              <p style={{ margin: "0 0 12px", color: "#6b7280", fontSize: "0.9rem" }}>
                {[o.type_poste, o.localisation, o.groupe_politique].filter(Boolean).join(" · ")}
                {o.publie_le ? ` · publiée le ${dateFr(o.publie_le)}` : ""}
              </p>
              {o.description && (
                <p style={{ margin: "0 0 12px", whiteSpace: "pre-line" }}>
                  {o.description.length > 600 ? o.description.slice(0, 600) + "…" : o.description}
                </p>
              )}
              {o.source_url && (
                <p style={{ margin: 0 }}>
                  <a href={o.source_url} rel="noopener noreferrer nofollow" target="_blank">
                    Voir l'offre →
                  </a>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
