import "server-only";
import { dataQuery } from "./data";
import { cleNom } from "./format";
import { releverJour, type MesureJORF } from "./jorf";
import { dataAdmin } from "./supabaseAdmin";

// Import des mesures nominatives du JORF dans les tables `ministres` et
// `cabinets_ministeriels` (migration 2026-10-03_gouvernement_cabinets_suppleances
// + 2026-10-04_jorf_releves), avec suivi des jours balayés dans `jorf_releves`.
// Les écritures passent par la clé service_role (dataAdmin) ; la lecture du
// référentiel (rapprochement parlementaires / collaborateurs) reste publique.

export type JourJORF = { date: string; nb: number; ministres: number; cabinets: number; erreurs: string[] };

const idMinistre = (nom: string, date: string) => `MIN-${nom.toUpperCase().replace(/[^A-Z]/g, "")}-${date.replace(/-/g, "")}`;
const idCabinet = (ministreId: string, prenom: string, nom: string) => `CAB-${ministreId}-${cleNom(prenom, nom).replace(/ /g, "-").toUpperCase()}`;

// Rapprochement d'une personne avec le référentiel des parlementaires
// (l'ordre prénom/nom peut varier dans le JORF : on essaie les deux).
async function chercherParlementaire(prenom: string, nom: string): Promise<string | null> {
  const or = `(and(nom.ilike.${nom},prenom.ilike.${prenom}),and(nom.ilike.${prenom},prenom.ilike.${nom}))`;
  const { rows } = await dataQuery<{ personne_id: string }>("parlementaires",
    new URLSearchParams({ select: "personne_id", or, limit: "1" }), 3600);
  return rows[0]?.personne_id ?? null;
}

// Rapprochement avec les collaborateurs parlementaires connus (même clé normalisée).
async function chercherCollaborateur(prenom: string, nom: string): Promise<{ collab_id: string; collab_prenom: string; collab_nom: string } | null> {
  const { rows } = await dataQuery<{ collab_id: string; collab_prenom: string; collab_nom: string }>("collaborateurs",
    new URLSearchParams({ select: "collab_id,collab_prenom,collab_nom", collab_cle: `eq.${cleNom(prenom, nom)}`, limit: "1" }), 3600);
  return rows[0] ?? null;
}

async function chercherMinistre(prenom: string, nom: string): Promise<string | null> {
  const or = `(and(nom.ilike.${nom},prenom.ilike.${prenom}),and(nom.ilike.${prenom},prenom.ilike.${nom}))`;
  const { rows } = await dataQuery<{ id: string }>("ministres",
    new URLSearchParams({ select: "id", or, order: "debut.desc", limit: "1" }), 3600);
  return rows[0]?.id ?? null;
}

// Le nom du gouvernement (« Gouvernement Borne »…) quand il est cité.
const gouvernementDu = (extrait: string): string =>
  /gouvernement\s+([A-ZÉÈ][a-zéè]+(?:\s+[IV]+)?)/.exec(extrait)?.[1] ?? "";

// Un jour du JORF : relève, rapprochements, écritures.
export async function importerJour(date: string): Promise<JourJORF> {
  const mesures = await releverJour(date);
  const out: JourJORF = { date, nb: mesures.length, ministres: 0, cabinets: 0, erreurs: [] };
  const db = dataAdmin();
  for (const m of mesures) {
    try {
      if (m.role === "ministre") {
        const personneId = await chercherParlementaire(m.prenom, m.nom).catch(() => null);
        if (m.type === "cessation") {
          const { data: deja } = await db.from("ministres").select("id").ilike("nom", m.nom).ilike("prenom", m.prenom).is("fin", null);
          if (deja?.length) await db.from("ministres").update({ fin: m.date, synced_at: new Date().toISOString() }).in("id", deja.map((x: { id: string }) => x.id));
        } else {
          await db.from("ministres").upsert({
            id: idMinistre(m.nom, m.date), personne_id: personneId, civilite: m.civilite,
            prenom: m.prenom, nom: m.nom,
            fonction: m.fonction || "ministre", portefeuille: m.portefeuille,
            gouvernement: gouvernementDu(m.extrait), rang: "",
            debut: m.date, fin: null,
            source: `JORF ${m.id_texte}`, confiance: "officiel",
          });
        }
        out.ministres++;
      } else {
        // Membre de cabinet : il faut le ministre de rattachement.
        const ref = m.ministre ?? { prenom: "", nom: "" };
        let ministreId = ref.nom ? await chercherMinistre(ref.prenom, ref.nom).catch(() => null) : null;
        if (!ministreId && ref.nom) {
          const id = idMinistre(ref.nom, m.date);
          await db.from("ministres").upsert({
            id, personne_id: null, civilite: "M.", prenom: ref.prenom, nom: ref.nom,
            fonction: "ministre", portefeuille: "", gouvernement: gouvernementDu(m.extrait), rang: "",
            debut: m.date, fin: null, source: `JORF ${m.id_texte} (rattachement de cabinet)`, confiance: "officiel",
          }).then(() => { ministreId = id; });
        }
        if (!ministreId) { out.erreurs.push(`${m.prenom} ${m.nom} : ministre de rattachement introuvable`); continue; }
        const cle = cleNom(m.prenom, m.nom);
        const collab = await chercherCollaborateur(m.prenom, m.nom).catch(() => null);
        if (m.type === "cessation") {
          await db.from("cabinets_ministeriels").update({ fin: m.date, synced_at: new Date().toISOString() }).eq("collab_cle", cle).is("fin", null);
        } else {
          const personneId = collab ? null : await chercherParlementaire(m.prenom, m.nom).catch(() => null);
          await db.from("cabinets_ministeriels").upsert({
            id: idCabinet(ministreId, m.prenom, m.nom), ministre_id: ministreId,
            personne_id: personneId, collab_id: collab?.collab_id ?? null, collab_cle: cle,
            collab_nom: (collab?.collab_nom ?? m.nom).toUpperCase(), collab_prenom: collab?.collab_prenom ?? m.prenom,
            fonction: m.fonction || "membre de cabinet",
            source: `JORF ${m.id_texte}`, confiance: "officiel", date_source: m.date,
            debut: m.date, fin: null,
          });
        }
        out.cabinets++;
      }
    } catch (e) { out.erreurs.push(`${m.prenom} ${m.nom} : ${(e as Error).message}`); }
  }
  await db.from("jorf_releves").upsert({
    date_jorf: date, nb_mesures: out.nb, nb_ministres: out.ministres, nb_cabinets: out.cabinets,
    erreurs: out.erreurs.slice(0, 5).join(" | ").slice(0, 500), synced_at: new Date().toISOString(),
  });
  return out;
}

// Jours déjà balayés (clé service_role : la table n'est pas lue publiquement).
export async function joursBalayes(): Promise<Set<string>> {
  const rows = await dataAdmin().from("jorf_releves").select("date_jorf").limit(10_000);
  return new Set((rows.data ?? []).map((x: { date_jorf: string }) => x.date_jorf));
}

export const demain = (date: string): string => new Date(Date.parse(date) + 86_400_000).toISOString().slice(0, 10);

// Balayage d'une plage de jours, reprise là où il s'était arrêté. Le budget
// (ms) borne la durée : on rend la main avant l'expiration du serveur, avec le
// prochain jour à traiter — le front peut rappeler.
export async function balayer(debut: string, fin: string, budgetMs: number, force = false): Promise<{ jours: JourJORF[]; prochain: string | null; restants: number }> {
  const vus = force ? new Set<string>() : await joursBalayes();
  const jours: JourJORF[] = [];
  const t0 = Date.now();
  let d = debut, restants = 0;
  while (d <= fin) {
    if (Date.now() - t0 > budgetMs) { restants++; d = demain(d); continue; }
    if (vus.has(d)) { d = demain(d); continue; }
    const jour = await importerJour(d).catch((e): JourJORF => ({ date: d, nb: 0, ministres: 0, cabinets: 0, erreurs: [(e as Error).message] }));
    jours.push(jour);
    vus.add(d);
    d = demain(d);
  }
  const premierNonFait = (() => { let x = debut; while (x <= fin && vus.has(x)) x = demain(x); return x; })();
  return { jours, prochain: premierNonFait <= fin ? premierNonFait : null, restants };
}

// Statut pour l'admin : jours balayés, contenu des tables, prochaine étape.
export async function statutJORF(): Promise<{ scan: { jours: number; premiere: string | null; derniere: string | null }; prochain: string | null; restants: number }> {
  const db = dataAdmin();
  const releves = await db.from("jorf_releves").select("date_jorf,nb_mesures,nb_ministres,nb_cabinets,erreurs").order("date_jorf").limit(5000);
  const dates = (releves.data ?? []).map((x: { date_jorf: string }) => x.date_jorf);
  const vus = new Set(dates);
  const hier = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  let d = "2017-01-01", prochain: string | null = null;
  while (d <= hier) { if (!vus.has(d)) { prochain = d; break; } d = demain(d); }
  let restants = 0;
  if (prochain) { let x = prochain; while (x <= hier) { restants++; x = demain(x); } }
  return {
    scan: { jours: dates.length, premiere: dates[0] ?? null, derniere: dates[dates.length - 1] ?? null },
    prochain, restants,
  };
}
