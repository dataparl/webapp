import { avecAdmin, erreur } from "@/lib/adminRoute";
import { dataAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Espace Élus de l'admin : recherche d'un parlementaire puis fiche complète
// (données synchronisées + éditions manuelles : bios, mandats, fonctions).

export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const url = new URL(req.url);
    const personne_id = url.searchParams.get("personne_id");

    // Détail d'un élu : fiche, mandats et appartenances synchronisés, éditions manuelles.
    if (personne_id) {
      const db = dataAdmin();
      const [fiches, mandats, appartenances, bios, manuels, fonctions] = await Promise.all([
        db.from("parlementaires").select("personne_id,elu_id,slug,chambre,civilite,prenom,nom,date_naissance,actif,circonscription,departement,groupe,groupe_libelle,photo_url,url_officielle,premier_mandat,fin_mandat").eq("personne_id", personne_id).limit(1),
        db.from("mandats").select("id,personne_id,chambre,elu_id,libelle,circonscription,debut,fin,cause_fin,legislature").eq("personne_id", personne_id).order("debut", { ascending: false }),
        db.from("appartenances").select("id,personne_id,chambre,elu_id,type,code,libelle,sigle,fonction,debut,fin").eq("personne_id", personne_id).order("debut", { ascending: false }),
        db.from("bios").select("*").eq("personne_id", personne_id).limit(1),
        db.from("mandats_manuels").select("*").eq("personne_id", personne_id).order("debut", { ascending: false }),
        db.from("fonctions_manuelles").select("*").eq("personne_id", personne_id).order("debut", { ascending: false }),
      ]);
      if (fiches.error) throw fiches.error;
      if (!fiches.data?.length) return erreur(404, "élu introuvable");
      return {
        fiche: fiches.data[0],
        mandats: mandats.data ?? [],
        appartenances: appartenances.data ?? [],
        bio: bios.data?.[0] ?? null,
        mandats_manuels: manuels.data ?? [],
        fonctions_manuelles: fonctions.data ?? [],
      };
    }

    // Recherche plein texte (prénom, nom, circonscription) sur les parlementaires.
    const q = (url.searchParams.get("q") ?? "").trim().slice(0, 80).replace(/[,()]/g, " ");
    if (q.length < 2) return { elus: [] };
    const filtre = `nom.ilike.%${q}%,prenom.ilike.%${q}%,circonscription.ilike.%${q}%`;
    const { data, error } = await dataAdmin().from("parlementaires")
      .select("personne_id,slug,chambre,civilite,prenom,nom,actif,circonscription,groupe,premier_mandat")
      .or(filtre)
      .order("actif", { ascending: false })
      .order("nom")
      .limit(20);
    if (error) throw error;
    return { elus: data ?? [] };
  }, "elus");
}
