import "server-only";
import { dataQuery, type Elu } from "./data";
import { equipe, mouvementsElu } from "./elus";

// Historique mensuel de l'équipe d'un élu pour les pages d'indicateurs
// (/vigiparl/<id> et /mixiparl/<id>). La composition actuelle (affectations)
// sert d'ancre certaine, puis on remonte le temps en « défaisant » les
// mouvements mois par mois : chaque arrivée retirée, chaque départ remis.
// Le point de départ est le début du premier mandat connu (table mandats),
// ou à défaut le premier mouvement connu.

export type MouvementEquipe = {
  date_event: string;
  type: string;
  collab_civilite: string;
  elu_cle: string;
  elu_id: string;
  elu_origine_cle: string | null;
  elu_origine_id: string | null;
};

export type MoisEquipe = {
  mois: string; // « 2024-03 » : état de l'équipe à la fin du mois
  femmes: number;
  hommes: number;
  arrivees: number;
  departs: number;
};

export async function premierMandat(e: Elu): Promise<string | null> {
  if (!e.id) return null;
  const p = new URLSearchParams({ select: "debut", elu_id: `eq.${e.id}`, order: "debut.asc", limit: "1" });
  const { rows } = await dataQuery<{ debut: string }>("mandats", p, 3600);
  return rows[0]?.debut ?? null;
}

const MOIS = (d: string) => d.slice(0, 7);
const genre = (civilite: string): "f" | "h" => (civilite === "Mme" ? "f" : "h");
const SUIVANT = (m: string): string => {
  const [a, mm] = m.split("-").map(Number);
  return mm === 12 ? `${a + 1}-01` : `${a}-${String(mm + 1).padStart(2, "0")}`;
};

export async function historiqueMensuel(e: Elu): Promise<{ points: MoisEquipe[]; debutSuivi: string | null }> {
  const [equ, mvt, mandat] = await Promise.all([
    equipe(e).catch(() => []),
    mouvementsElu(e, 1000).catch(() => []),
    premierMandat(e).catch(() => null),
  ]);

  // Ancre : la composition actuelle de l'équipe (affectations en cours).
  let femmes = 0;
  let hommes = 0;
  for (const a of equ) {
    if (a.collab_civilite === "Mme") femmes += 1;
    else hommes += 1;
  }

  // Mouvements classés arrivée / départ pour cet élu (un transfert compte
  // comme une arrivée si l'élu est la destination, comme un départ s'il est
  // l'origine).
  const arr: Map<string, { f: number; h: number }> = new Map();
  const dep: Map<string, { f: number; h: number }> = new Map();
  const noter = (table: Map<string, { f: number; h: number }>, mois: string, g: "f" | "h") => {
    const t = table.get(mois) ?? { f: 0, h: 0 };
    t[g] += 1;
    table.set(mois, t);
  };
  for (const m of mvt as unknown as MouvementEquipe[]) {
    const g = genre(m.collab_civilite);
    const mois = MOIS(m.date_event);
    const dest = m.elu_cle === e.cle || (!!e.id && !!m.elu_id && m.elu_id === e.id);
    const orig = (!!m.elu_origine_cle && m.elu_origine_cle === e.cle) || (!!e.id && !!m.elu_origine_id && m.elu_origine_id === e.id);
    if (m.type === "arrivee" && dest) noter(arr, mois, g);
    else if (m.type === "depart" && (dest || orig)) noter(dep, mois, g);
    else if (m.type === "transfert") {
      if (dest) noter(arr, mois, g);
      if (orig) noter(dep, mois, g);
    }
  }

  const dates = mvt.map((m) => MOIS(m.date_event));
  const premierMouvement = dates.length ? dates.reduce((a, b) => (a < b ? a : b)) : null;
  const candidats = [mandat?.slice(0, 7) ?? null, premierMouvement].filter(Boolean) as string[];
  if (!candidats.length) return { points: [], debutSuivi: null };
  // On ne remonte pas avant l'élection : le premier mois de suivi est le
  // plus tardif entre le premier mandat et le premier mouvement connu.
  const debut = candidats.reduce((a, b) => (a > b ? a : b));

  // Liste des mois du suivi, du premier au mois courant inclus.
  const maintenant = new Date().toISOString().slice(0, 7);
  const liste: string[] = [];
  for (let m = debut; m <= maintenant && liste.length < 600; m = SUIVANT(m)) liste.push(m);

  // Remontée : le point du mois M vient de l'état courant en « défaisant »
  // les mouvements du mois courant, puis du précédent, etc.
  const points: MoisEquipe[] = [];
  for (let i = liste.length - 1; i >= 0; i -= 1) {
    const m = liste[i];
    const a = arr.get(m) ?? { f: 0, h: 0 };
    const d = dep.get(m) ?? { f: 0, h: 0 };
    points[i] = { mois: m, femmes, hommes, arrivees: a.f + a.h, departs: d.f + d.h };
    // État à la fin du mois précédent : on retire les arrivées du mois,
    // on remet les départs.
    femmes = Math.max(0, femmes - a.f + d.f);
    hommes = Math.max(0, hommes - a.h + d.h);
  }
  return { points, debutSuivi: debut };
}
