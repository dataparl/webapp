import "server-only";
import { randomBytes } from "node:crypto";
import { slugDe } from "./communication";
import { NOTION_DATABASE_ID, secret } from "./env";
import { authAdmin } from "./supabaseAdmin";

// Synchronisation des communiqués depuis une base Notion (CMS headless) :
// les pages au statut « Publié » deviennent des communiqués publiés sur le
// site, « Retiré » les dépublie (retour en brouillon, jamais de suppression).
// Le corps de la page Notion est converti dans le Markdown simple compris
// par texteVersHtml : paragraphes, listes « - », citations « > », **gras**,
// *italique*, [liens](https://…). Sans dépendance : API REST Notion via fetch.
// Convention de la base : propriétés « Titre » (titre), « Statut » (select :
// Publié / Retiré), « Chapô », « Slug » (facultatif) et « Date de publication »
// (facultative). La correspondance avec la table communiques se fait par slug :
// pour renommer un titre sans créer de duplicata, fixe la propriété Slug.

const API = "https://api.notion.com/v1";
const VERSION = "2022-06-28";

export function notionActif(): boolean {
  return !!process.env.NOTION_TOKEN && !!NOTION_DATABASE_ID;
}

async function apiNotion<T>(chemin: string, init?: RequestInit): Promise<T> {
  const r = await fetch(API + chemin, {
    ...init,
    headers: { Authorization: "Bearer " + secret("NOTION_TOKEN"), "Notion-Version": VERSION, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (!r.ok) throw new Error("Notion " + chemin.slice(0, 40) + " : HTTP " + r.status + " " + (await r.text()).slice(0, 200));
  return (await r.json()) as T;
}

// ── Propriétés de page ─────────────────────────────────────────────────
type RichText = { plain_text: string; href?: string | null; annotations?: { bold?: boolean; italic?: boolean; code?: boolean } };
type Prop = { type?: string; title?: RichText[]; rich_text?: RichText[]; select?: { name: string } | null; date?: { start: string } | null };
type PageNotion = { id: string; properties: Record<string, Prop> };

// Riche texte Notion → Markdown (liens, gras, italique ; le code en ligne
// devient du texte : texteVersHtml ne rend pas de bloc de code).
function texte(rt: RichText[] | undefined): string {
  if (!rt) return "";
  return rt.map((s) => {
    let t = s.plain_text;
    if (s.href) t = "[" + t + "](" + s.href + ")";
    if (s.annotations?.italic) t = "*" + t + "*";
    if (s.annotations?.bold) t = "**" + t + "**";
    return t;
  }).join("");
}

function titreDe(p: PageNotion): string {
  for (const prop of Object.values(p.properties)) if (prop.type === "title") return texte(prop.title);
  return "";
}

const sansAccent = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

// ── Blocs → corps du communiqué ────────────────────────────────────────
type Bloc = { type: string; [k: string]: unknown };

function ligneDuBloc(b: Bloc): string | null {
  const rt = (x: any) => texte(x?.rich_text);
  switch (b.type) {
    case "paragraph": return rt(b.paragraph) || null;
    case "heading_1": case "heading_2": case "heading_3": {
      const t = rt((b as any)[b.type]);
      return t ? "**" + t + "**" : null;
    }
    case "bulleted_list_item": case "numbered_list_item": {
      const t = rt((b as any)[b.type]);
      return t ? "- " + t : null;
    }
    case "quote": { const t = rt(b.quote); return t ? "> " + t : null; }
    case "callout": case "toggle": { const t = rt((b as any)[b.type]); return t ? "**" + t + "**" : null; }
    case "code": {
      const c = (b as any).code;
      const t = texte(c?.rich_text);
      return t ? t.split("\n").map((l) => "> " + l).join("\n") : null;
    }
    case "image": {
      const img = (b as any).image;
      const url = img?.external?.url ?? img?.file?.url ?? "";
      const alt = texte(img?.caption) || "Image";
      return url ? "[" + alt + "](" + url + ")" : alt;
    }
    default: return null; // tableaux, embeds… : ignorés en v1
  }
}

// Blocs enfants d'un bloc (ex. sous-puces d'un item de liste), aplatis.
async function enfants(blocId: string): Promise<Bloc[]> {
  const out: Bloc[] = [];
  let curseur: string | undefined;
  for (let page = 0; page < 3; page++) {
    const q = new URLSearchParams({ page_size: "100" });
    if (curseur) q.set("start_cursor", curseur);
    const r = await apiNotion<{ results: Bloc[]; has_more: boolean; next_cursor?: string }>("/blocks/" + blocId + "/children?" + q);
    out.push(...r.results);
    if (!r.has_more || !r.next_cursor) break;
    curseur = r.next_cursor;
  }
  return out;
}

// Blocs d'une page, récursifs sur les items de liste : les sous-puces Notion
// deviennent des lignes « - » au même niveau (texteVersHtml n'imbrique pas).
async function blocsAvecEnfants(pageId: string): Promise<Bloc[]> {
  const out: Bloc[] = [];
  const ajouter = async (blocs: Bloc[]) => {
    for (const b of blocs) {
      out.push(b);
      if ((b as any).has_children && (b.type === "bulleted_list_item" || b.type === "numbered_list_item")) {
        const sous = await enfants(b.id);
        if (sous.length) await ajouter(sous);
      }
    }
  };
  let curseur: string | undefined;
  for (let page = 0; page < 3 && out.length < 300; page++) {
    const q = new URLSearchParams({ page_size: "100" });
    if (curseur) q.set("start_cursor", curseur);
    const r = await apiNotion<{ results: Bloc[]; has_more: boolean; next_cursor?: string }>("/blocks/" + pageId + "/children?" + q);
    await ajouter(r.results);
    if (!r.has_more || !r.next_cursor) break;
    curseur = r.next_cursor;
  }
  return out;
}

async function corpsNotion(pageId: string): Promise<string> {
  const lignes: string[] = [];
  for (const b of await blocsAvecEnfants(pageId)) { const l = ligneDuBloc(b); if (l) lignes.push(l); }
  // Items de liste et lignes de citation contigus sur une même ligne par
  // élément ; les autres blocs séparés par une ligne vide (texteVersHtml).
  const out: string[] = [];
  for (const l of lignes) {
    if (out.length) {
      const prec = out[out.length - 1];
      const liste = (a: string, b: string) => a.startsWith("- ") && b.startsWith("- ");
      const cite = (a: string, b: string) => a.startsWith(">") && b.startsWith(">");
      out.push(liste(prec, l) || cite(prec, l) ? "\n" : "\n\n");
    }
    out.push(l);
  }
  return out.join("").trim().slice(0, 20000);
}

// ── Pages de la base ──────────────────────────────────────────────────
async function pagesCommuniques(): Promise<PageNotion[]> {
  const out: PageNotion[] = [];
  let curseur: string | undefined;
  for (let page = 0; page < 5; page++) {
    const r = await apiNotion<{ results: PageNotion[]; has_more: boolean; next_cursor?: string }>("/databases/" + NOTION_DATABASE_ID + "/query", {
      method: "POST", body: JSON.stringify({ page_size: 100, ...(curseur ? { start_cursor: curseur } : {}) }),
    });
    out.push(...r.results);
    if (!r.has_more || !r.next_cursor) break;
    curseur = r.next_cursor;
  }
  return out;
}

// ── Synchronisation ───────────────────────────────────────────────────
export type ResSyncNotion = { publies: number; misAJour: number; retires: number; erreurs: string[] };

export async function synchroniserCommuniquesNotion(db: ReturnType<typeof authAdmin>, creePar?: string): Promise<ResSyncNotion> {
  if (!notionActif()) throw new Error("Notion non configuré : renseigne NOTION_TOKEN et NOTION_DATABASE_ID dans les variables d'environnement.");
  const pages = await pagesCommuniques();
  const maintenant = new Date().toISOString();
  const vus = new Set<string>();
  const r: ResSyncNotion = { publies: 0, misAJour: 0, retires: 0, erreurs: [] };
  for (const p of pages) {
    const titre = titreDe(p).trim();
    if (!titre) continue;
    const statut = sansAccent(p.properties["Statut"]?.select?.name ?? "");
    const slugPerso = texte(p.properties["Slug"]?.rich_text).trim();
    let slug = /^[a-z0-9-]{1,80}$/.test(slugPerso) ? slugPerso : slugDe(titre);
    if (vus.has(slug)) slug = slug.slice(0, 62) + "-" + randomBytes(2).toString("hex");
    vus.add(slug);
    try {
      const { data: ex } = await db.from("communiques").select("id, publie_le").eq("slug", slug).maybeSingle();
      if (statut === "retire") {
        if (ex) { await db.from("communiques").update({ statut: "brouillon" }).eq("id", ex.id); r.retires += 1; }
        continue;
      }
      if (statut !== "publie") continue;
      const [corps, chapo] = await Promise.all([corpsNotion(p.id), Promise.resolve(texte(p.properties["Chapô"]?.rich_text).trim().slice(0, 600))]);
      const publieLe = (ex?.publie_le as string | null) ?? p.properties["Date de publication"]?.date?.start ?? maintenant;
      if (ex) {
        await db.from("communiques").update({ titre: titre.slice(0, 160), chapo, corps, statut: "publie", publie_le: publieLe, maj_le: maintenant }).eq("id", ex.id);
        r.misAJour += 1;
      } else {
        const { error } = await db.from("communiques").insert({ slug, titre: titre.slice(0, 160), chapo, corps, statut: "publie", publie_le: publieLe, ...(creePar ? { cree_par: creePar } : {}) });
        if (error) throw error;
        r.publies += 1;
      }
    } catch (e) {
      r.erreurs.push(titre.slice(0, 60) + " : " + (e instanceof Error ? e.message : String(e)).slice(0, 120));
    }
  }
  return r;
}