import "server-only";
import { AUTH_SUPABASE_KEY, AUTH_SUPABASE_URL } from "./env";

// Feuilles du tableur DataParl' Sheets (drive.dataparl.fr) publiées en libre
// accès : lues dans sheets_publication (dataparl-auth) avec la clé publique,
// gardées 60 s en mémoire. L'équipe choisit ce qui est publié dans l'admin
// (Contenu → DataParl' Sheets). En cas de panne : les trois feuilles publiées
// à l'ouverture du service restent accessibles.

export const DEFAUT_PUBLIEES = ["vigiparl-annual-chart", "mixiparl-annual-chart", "gouvernements-2017-2026"];

let cache: { le: number; ids: string[] } | null = null;
const DUREE_MS = 60_000;

let enCours: Promise<string[]> | null = null;

export function feuillesPubliees(): Promise<string[]> {
  if (cache && Date.now() - cache.le < DUREE_MS) return Promise.resolve(cache.ids);
  enCours ??= charger().finally(() => { enCours = null; });
  return enCours;
}

async function charger(): Promise<string[]> {
  try {
    const r = await fetch(`${AUTH_SUPABASE_URL}/rest/v1/sheets_publication?select=id&publie=eq.true`, {
      headers: { apikey: AUTH_SUPABASE_KEY, Authorization: `Bearer ${AUTH_SUPABASE_KEY}` },
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (!r.ok) throw new Error(String(r.status));
    const ids = ((await r.json()) as { id: string }[]).map((x) => x.id);
    // Table lue mais vide (avant le seed, par exemple) : valeurs d'ouverture.
    cache = { le: Date.now(), ids: ids.length ? ids : [...DEFAUT_PUBLIEES] };
  } catch {
    cache = { le: Date.now() - DUREE_MS + 10_000, ids: cache?.ids ?? [...DEFAUT_PUBLIEES] }; // nouvel essai dans 10 s
  }
  return cache.ids;
}

export function oublierCacheFeuilles(): void {
  cache = null;
}
