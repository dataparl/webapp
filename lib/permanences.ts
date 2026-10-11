// GÉNÉRÉ par scripts/permanences.mjs — ne pas modifier à la main.
// Tant que la collecte n'a pas tourné (workflow « Permanences » ou run local),
// la carte /parlementaires/map s'affiche vide avec un message d'attente.
export type ChambrePermanence = "assemblee" | "senat" | "europarl";
export type Permanence = { c: ChambrePermanence; s: string; n: string; g: string; a: string; v: string; lat: number; lon: number };
export const PERMANENCES: { maj: string | null; points: Permanence[] } = { maj: null, points: [] };
