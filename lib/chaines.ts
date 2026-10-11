// Chaînes WhatsApp et Telegram : récap quotidien de TOUS les mouvements du
// jour, identique pour tous les abonnés (diffusion) — contrairement aux
// alertes email (/api/cron/alertes), personnalisées par abonnement.
// Sans dépendance serveur, pour rester testable côté rendu.
import { CHAMBRE_LONG, TYPE, dateLongue, nomAffiche, prenomNom } from "./format.ts";
import type { MvtAlerte } from "./alertes.ts";

export const SITE = "https://www.dataparl.fr";
export const MAX_LIGNES_CHAINE = 30; // taille d'un message de diffusion
const CHAMBRES = ["assemblee", "senat", "europarl"] as const;

const phrase = (m: MvtAlerte) => {
  const qui = prenomNom(m.collab_prenom, m.collab_nom);
  const elu = `${nomAffiche(m.elu_nom)}${m.elu_groupe ? ` (${m.elu_groupe})` : ""}`;
  return m.type === "arrivee" ? `${qui} rejoint l'équipe de ${elu}`
    : m.type === "depart" ? `${qui} quitte l'équipe de ${elu}`
      : `${qui} passe de l'équipe de ${nomAffiche(m.elu_origine_nom)} à celle de ${elu}`;
};

const pluriel = (n: number, s: string, p = `${s}s`) => `${n} ${n > 1 ? p : s}`;

// « 12 mouvements : 7 arrivées, 3 départs, 2 transferts » (paramètre de
// gabarit WhatsApp et première ligne des chaînes).
export function recapResume(mvts: MvtAlerte[]): string {
  const c = (t: string) => mvts.filter((m) => m.type === t).length;
  return `${pluriel(mvts.length, "mouvement")} : ${pluriel(c("arrivee"), "arrivée")} ${pluriel(c("depart"), "départ")} ${pluriel(c("transfert"), "transfert")}`;
}

// Version texte (WhatsApp, et secours de toute autre chaîne).
export function recapTexte(mvts: MvtAlerte[], jour: string): string {
  const lien = `${SITE}/daily/${jour}`;
  const affiches = mvts.slice(0, MAX_LIGNES_CHAINE);
  const sections = CHAMBRES.filter((c) => affiches.some((m) => m.chambre === c));
  const corps = sections.map((c) => {
    const ms = affiches.filter((m) => m.chambre === c);
    return `${CHAMBRE_LONG[c] ?? c} (${ms.length})\n` + ms.map((m) => `${TYPE[m.type] ?? m.type} · ${phrase(m)}`).join("\n");
  }).join("\n\n");
  const reste = mvts.length - affiches.length;
  const lignes = [
    `DataParl' Daily — ${dateLongue(jour)}`,
    recapResume(mvts),
    "",
    corps,
  ];
  if (reste > 0) lignes.push("", `Et ${reste} autre${reste > 1 ? "s" : ""}…`);
  lignes.push("", `Tout voir : ${lien}`);
  return lignes.join("\n");
}

// Version Telegram (HTML).
const escT = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function recapTelegram(mvts: MvtAlerte[], jour: string): string {
  const lien = `${SITE}/daily/${jour}`;
  const affiches = mvts.slice(0, MAX_LIGNES_CHAINE);
  const sections = CHAMBRES.filter((c) => affiches.some((m) => m.chambre === c));
  const corps = sections.map((c) => {
    const ms = affiches.filter((m) => m.chambre === c);
    return `<b>${escT(CHAMBRE_LONG[c] ?? c)}</b> (${ms.length})\n` +
      ms.map((m) => `${escT(TYPE[m.type] ?? m.type)} · ${escT(phrase(m))}`).join("\n");
  }).join("\n\n");
  const reste = mvts.length - affiches.length;
  const lignes = [
    "📣 <b>DataParl' Daily — " + escT(dateLongue(jour)) + "</b>",
    escT(recapResume(mvts)),
    "",
    corps,
  ];
  if (reste > 0) lignes.push("", `Et ${reste} autre${reste > 1 ? "s" : ""}…`);
  lignes.push("", "👉 Tout voir : " + lien);
  return lignes.join("\n");
}
