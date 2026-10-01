// Photos des élus servies par DataParl' : media.dataparl.fr/<chambre>/<id>_<credit>_<taille>.png
// (aussi sous www.dataparl.fr/media/…). `credit` nomme le détenteur de l'image :
// an (Assemblée nationale), senat (Sénat), pe (Parlement européen). Sans dépendance (testé).
export const CODE_CHAMBRE: Record<string, "an" | "senat" | "pe"> = { assemblee: "an", senat: "senat", europarl: "pe" };
export const CHAMBRE_DE_CODE: Record<string, "assemblee" | "senat" | "europarl"> = { an: "assemblee", senat: "senat", pe: "europarl" };
export const CREDIT: Record<string, string> = { an: "Assemblée nationale", senat: "Sénat", pe: "Parlement européen" };
export const TAILLES = [96, 200, 400] as const;

// Base des adresses : vide (chemin relatif /media) par défaut ; https://media.dataparl.fr une fois le sous-domaine en place.
export const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE ?? "/media").replace(/\/$/, "");

export function cheminPhoto(chambre: string, slug: string, taille: (typeof TAILLES)[number] = 200): string | null {
  const c = CODE_CHAMBRE[chambre];
  if (!c || !slug) return null;
  return `${MEDIA_BASE}/${c}/${encodeURIComponent(slug)}_${c}_${taille}.png`;
}

export const photoAbsolue = (chambre: string, slug: string, taille: (typeof TAILLES)[number] = 400) => {
  const p = cheminPhoto(chambre, slug, taille);
  return p ? (p.startsWith("http") ? p : `https://www.dataparl.fr${p}`) : null;
};

// « sido_bruno01058x_senat_200.png » -> { id, credit, taille } (l'identifiant peut contenir des « _ »).
export function analyserFichier(fichier: string): { id: string; credit: string; taille: number } | null {
  const m = /^([\p{L}\p{N}_-]{1,80})_(an|senat|pe)_(\d{2,4})\.png$/u.exec(fichier);
  if (!m || !(TAILLES as readonly number[]).includes(Number(m[3]))) return null;
  return { id: m[1], credit: m[2], taille: Number(m[3]) };
}

// Seuls les sites officiels sont lus.
export function sourceAutorisee(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && ["www.assemblee-nationale.fr", "www2.assemblee-nationale.fr", "www.senat.fr", "www.europarl.europa.eu"].includes(u.hostname);
  } catch { return false; }
}
