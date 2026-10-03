// Registre des pages publiques de dataparl.fr : source de vérité du module
// « Plan du site » de l'admin et du sitemap public. Une page désactivée (ou
// en brouillon) répond 404, ainsi que toutes ses sous-pages. Sans dépendance (testé).
export type Statut = "active" | "desactivee" | "brouillon";
export type PageSite = { chemin: string; titre: string; verrou?: string; dynamique?: string; sitemap?: boolean };

export const PAGES: PageSite[] = [
  { chemin: "/", titre: "Accueil", verrou: "L'accueil ne se désactive pas", sitemap: true },
  { chemin: "/mouvements", titre: "Mouvements", dynamique: "une page par chambre", sitemap: true },
  { chemin: "/daily", titre: "DataParl' Daily (jour par jour)", dynamique: "une page par jour publié", sitemap: true },
  { chemin: "/collab", titre: "Collaborateurs", dynamique: "une fiche par collaborateur (non indexée)", sitemap: true },
  { chemin: "/parlementaires", titre: "Parlementaires", dynamique: "une fiche par élu, une biographie par élu", sitemap: true },
  { chemin: "/senatoriales2026", titre: "Sénatoriales 2026", dynamique: "une page par département renouvelé", sitemap: true },
  { chemin: "/vigiparl", titre: "VigiParl'", sitemap: true },
  { chemin: "/vigiparl/methode", titre: "VigiParl' · méthode", sitemap: true },
  { chemin: "/vigiparl/timeline", titre: "VigiParl' · année par année", sitemap: true },
  { chemin: "/vigiparl/an/parlementaires", titre: "VigiParl' · Assemblée, par élu", sitemap: true },
  { chemin: "/vigiparl/senat/parlementaires", titre: "VigiParl' · Sénat, par élu", sitemap: true },
  { chemin: "/mixiparl", titre: "MixiParl'", sitemap: true },
  { chemin: "/mixiparl/methode", titre: "MixiParl' · méthode", sitemap: true },
  { chemin: "/mixiparl/timeline", titre: "MixiParl' · année par année", sitemap: true },
  { chemin: "/mixiparl/an/parlementaires", titre: "MixiParl' · Assemblée, par élu", sitemap: true },
  { chemin: "/mixiparl/senat/parlementaires", titre: "MixiParl' · Sénat, par élu", sitemap: true },
  { chemin: "/alertes", titre: "Alertes par email", sitemap: true },
  { chemin: "/presse", titre: "Presse & médias", sitemap: true },
  { chemin: "/presse/communiques", titre: "Communiqués de presse", dynamique: "une page par communiqué publié", sitemap: true },
  { chemin: "/faq", titre: "Questions fréquentes", sitemap: true },
  { chemin: "/contact", titre: "Contact", sitemap: true },
  { chemin: "/informations-legales", titre: "Informations légales", verrou: "Pages obligatoires", dynamique: "mentions, CGU, confidentialité, cookies, licences", sitemap: true },
  { chemin: "/connexion", titre: "Connexion", verrou: "Nécessaire aux comptes" },
  { chemin: "/mon-compte", titre: "Mon compte", verrou: "Nécessaire aux comptes" },
  { chemin: "/preferences", titre: "Préférences de communication", verrou: "Lien présent dans les emails" },
  { chemin: "/desinscription", titre: "Désinscription", verrou: "Lien présent dans les emails" },
];

export const cheminConnu = (c: string) => PAGES.some((p) => p.chemin === c && !p.verrou);

// Vrai si le chemin demandé tombe sous un chemin inactif (lui-même ou un parent).
export function estInactif(chemin: string, inactifs: Iterable<string>): boolean {
  const c = chemin.length > 1 ? chemin.replace(/\/+$/, "") : chemin;
  for (const i of inactifs) if (i !== "/" && (c === i || c.startsWith(`${i}/`))) return true;
  return false;
}

// Arbre d'affichage : profondeur d'après le chemin.
export const profondeur = (chemin: string) => (chemin === "/" ? 0 : chemin.split("/").length - 1);
