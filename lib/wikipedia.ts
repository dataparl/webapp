// Résumé Wikipédia d'un élu, pour enrichir les biographies (/parlementaires/[id]/bio).
// API REST de Wikipédia en français — contenu sous licence CC BY-SA 4.0 :
// chaque extrait affiché crédite l'article source.

export type ResumeWikipedia = {
  titre: string;
  extrait: string;
  url: string;
};

const UA = "DataParl' (https://www.dataparl.fr; contact@dataparl.fr)";

// L'article le plus probable : opensearch suit les redirections.
async function titreWikipedia(recherche: string): Promise<string | null> {
  const url = `https://fr.wikipedia.org/w/api.php?action=opensearch&format=json&limit=1&redirects=resolve&search=${encodeURIComponent(recherche)}`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate: 86400 } });
    if (!r.ok) return null;
    const j = (await r.json()) as [string, string[]];
    return j?.[1]?.[0] ?? null;
  } catch {
    return null;
  }
}

// Résumé de l'article Wikipédia d'un parlementaire (null si aucun article
// fiable n'est trouvé : page d'homonymie, homonyme sans lien avec l'élu).
export async function resumeWikipedia(prenom: string, nom: string): Promise<ResumeWikipedia | null> {
  const recherche = `${prenom} ${nom}`.trim();
  if (!recherche) return null;
  let titre = await titreWikipedia(recherche);
  // Sans article direct, tenter la précision habituelle « Prénom Nom (sénateur) ».
  if (!titre) titre = await titreWikipedia(`${recherche} (sénateur)`);
  if (!titre) return null;
  try {
    const r = await fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titre)}`, {
      headers: { "User-Agent": UA },
      next: { revalidate: 86400 },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as {
      title?: string; type?: string; extract?: string;
      content_urls?: { desktop?: { page?: string } };
    };
    if (!j.extract || j.type === "disambiguation") return null;
    const extrait = j.extract.trim();
    // Garde-fou contre les homonymes : l'extrait doit mentionner le nom.
    if (!extrait.toLowerCase().includes((nom || "").toLowerCase().slice(0, 4))) return null;
    const url = j.content_urls?.desktop?.page;
    if (!url) return null;
    return { titre: j.title ?? titre, extrait, url };
  } catch {
    return null;
  }
}
