import "server-only";
import { aujourdhuiParis } from "./alertes";
import { ajusterJournee } from "./exclusions";
import { COLONNES_PUBLIQUES, dataQuery, dataQueryTout, type Mouvement } from "./data";

// Pages « daily » : les mouvements publiés un jour donné.
export const PREMIER_JOUR = "2015-01-01";
export const LIBRES = 10; // mouvements visibles sans compte
export const CHAMBRES = ["assemblee", "senat", "europarl"] as const;

export type JourChambre = { date_event: string; chambre: string; n: number; arrivees: number; departs: number; transferts: number };
export type Jour = { date: string; n: number; parChambre: Record<string, JourChambre> };

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

// Date valide, depuis 2015 et pas dans le futur.
export function dateValide(d: string): boolean {
  const m = DATE.exec(d);
  if (!m) return false;
  const t = new Date(`${d}T12:00:00Z`);
  if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== d) return false;
  return d >= PREMIER_JOUR && d <= aujourdhuiParis();
}

export function dateTitre(d: string): string {
  const t = new Date(`${d}T12:00:00Z`);
  const jour = t.getUTCDate();
  const reste = t.toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
  return `${jour === 1 ? "1er" : jour} ${reste}`;
}

function regrouper(rows: JourChambre[]): Jour[] {
  const m = new Map<string, Jour>();
  for (const r of rows) {
    const j = m.get(r.date_event) ?? { date: r.date_event, n: 0, parChambre: {} };
    j.n += r.n; j.parChambre[r.chambre] = r;
    m.set(r.date_event, j);
  }
  return [...m.values()].sort((a, b) => b.date.localeCompare(a.date));
}

// Jours publiés entre deux dates (incluses), du plus récent au plus ancien.
export async function joursPublies(depuis: string, jusqua = aujourdhuiParis()): Promise<Jour[]> {
  const rows = await dataQueryTout<JourChambre>("mouvements_par_jour",
    new URLSearchParams({ select: "*", and: `(date_event.gte.${depuis},date_event.lte.${jusqua})`, order: "date_event.desc" }), 3600);
  // Exclusions temporaires : on retire les arrivées exclues des comptes du jour.
  return regrouper(rows.map(ajusterJournee).filter((r) => r.n > 0));
}

export async function derniersJours(n: number): Promise<Jour[]> {
  const { rows } = await dataQuery<{ date_event: string }>("mouvements_par_jour",
    new URLSearchParams({ select: "date_event", order: "date_event.desc", limit: String(n * 3) }), 3600);
  const dates = [...new Set(rows.map((r) => r.date_event))].slice(0, n);
  if (!dates.length) return [];
  return joursPublies(dates[dates.length - 1], dates[0]);
}

// Jour publié précédent et suivant (pour la navigation).
export async function voisins(date: string): Promise<{ avant: string | null; apres: string | null }> {
  const q = (op: string, ordre: string) => dataQuery<{ date_event: string }>("mouvements_par_jour",
    new URLSearchParams({ select: "date_event", date_event: `${op}.${date}`, order: `date_event.${ordre}`, limit: "1" }), 3600);
  const [a, b] = await Promise.all([q("lt", "desc"), q("gt", "asc")]);
  return { avant: a.rows[0]?.date_event ?? null, apres: b.rows[0]?.date_event ?? null };
}

// Les mouvements libres d'un jour : 10 au total, répartis entre les chambres.
// Les mouvements temporairement exclus (lib/exclusions.ts) ne prennent pas
// de place : on réserve les 10 lignes aux mouvements affichables.
export async function mouvementsLibres(date: string, jour: Jour | undefined): Promise<Mouvement[]> {
  if (!jour) return [];
  const presentes = CHAMBRES.filter((c) => jour.parChambre[c]?.n);
  const parChambre = await Promise.all(presentes.map((c) => dataQuery<Mouvement>("mouvements", new URLSearchParams({
    select: COLONNES_PUBLIQUES, date_event: `eq.${date}`, chambre: `eq.${c}`, order: "type.asc,id.asc", limit: String(LIBRES * 2),
  }), 3600).then((r) => r.rows)));
  // Une place à tour de rôle à chaque chambre qui a encore des mouvements.
  const pris = presentes.map(() => 0);
  let reste = LIBRES;
  while (reste > 0 && pris.some((p, i) => p < parChambre[i].length)) {
    for (let i = 0; i < presentes.length && reste > 0; i++) if (pris[i] < parChambre[i].length) { pris[i]++; reste--; }
  }
  return parChambre.flatMap((rows, i) => rows.slice(0, pris[i]));
}
