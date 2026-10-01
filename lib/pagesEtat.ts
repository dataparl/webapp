// Chemins inactifs (désactivés ou en brouillon), lus dans pages_etat avec la
// clé publique (lecture seule) et gardés 60 s en mémoire. Utilisé par le
// proxy (404) et les plans du site. En cas de panne : tout reste actif.
import { AUTH_SUPABASE_KEY, AUTH_SUPABASE_URL } from "./env";

let cache: { le: number; chemins: string[] } | null = null;
const DUREE_MS = 60_000;

let enCours: Promise<string[]> | null = null;

export function cheminsInactifs(): Promise<string[]> {
  if (cache && Date.now() - cache.le < DUREE_MS) return Promise.resolve(cache.chemins);
  enCours ??= charger().finally(() => { enCours = null; });
  return enCours;
}

async function charger(): Promise<string[]> {
  try {
    const r = await fetch(`${AUTH_SUPABASE_URL}/rest/v1/pages_etat?select=chemin&statut=neq.active`, {
      headers: { apikey: AUTH_SUPABASE_KEY, Authorization: `Bearer ${AUTH_SUPABASE_KEY}` }, cache: "no-store", signal: AbortSignal.timeout(1500),
    });
    if (!r.ok) throw new Error(String(r.status));
    cache = { le: Date.now(), chemins: ((await r.json()) as { chemin: string }[]).map((x) => x.chemin) };
  } catch {
    cache = { le: Date.now() - DUREE_MS + 10_000, chemins: cache?.chemins ?? [] }; // nouvel essai dans 10 s
  }
  return cache.chemins;
}

export function oublierCache(): void { cache = null; }
