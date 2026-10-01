import { avecAdmin, EQUIPE, erreur } from "@/lib/adminRoute";
import { boitesDe, expediteursDe, filtreBoites } from "@/lib/boites";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const DOSSIERS = ["inbox", "sent", "auto", "archive", "trash"] as const;
const AUTOMATIQUES = "(transactionnel,auto,alerte)";

// « Envoyés » = emails écrits depuis la webmail ; « Automatiques » = accusés
// de réception, emails transactionnels et alertes (même dossier en base).
interface Filtrable { eq(c: string, v: string): Filtrable; in(c: string, v: string[]): Filtrable; not(c: string, o: string, v: string): Filtrable }
function filtrer<Q>(requete: Q, dossier: string): Q {
  const q = requete as unknown as Filtrable;
  const r = dossier === "auto" ? q.eq("folder", "sent").in("communication_type", ["transactionnel", "auto", "alerte", "communique", "mailing"])
    : dossier === "sent" ? q.eq("folder", "sent").not("communication_type", "in", AUTOMATIQUES)
    : q.eq("folder", dossier);
  return r as unknown as Q;
}
const PAGE = 50;

export async function GET(req: Request) {
  return avecAdmin(req, async (a) => {
    const u = new URL(req.url).searchParams;
    // Boîtes : celles du rôle ; un admin peut en choisir une (?boite=).
    const choisie = (u.get("boite") ?? "").toLowerCase();
    const permises = boitesDe(a);
    const boites = permises ? (choisie && permises.includes(choisie) ? [choisie] : permises) : (choisie ? [choisie] : null);
    const restreindre = <Q extends { or: (f: string) => Q }>(q: Q): Q => (boites ? q.or(filtreBoites(boites)) : q);
    const dossier = u.get("dossier") ?? "inbox";
    if (!(DOSSIERS as readonly string[]).includes(dossier)) return erreur(400, "dossier inconnu");
    const page = Math.max(Number(u.get("page") ?? 0) || 0, 0);
    const q = (u.get("q") ?? "").trim().replace(/[%,()*"\\]/g, "").slice(0, 80);
    const db = authAdmin();
    let req1 = db.from("emails")
      .select("id, direction, from_addr, to_addr, subject, date, read, flagged, attachments, bounced_at", { count: "exact" })
      .order("date", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
    req1 = restreindre(filtrer(req1, dossier));
    if (q) req1 = req1.or(`subject.ilike.%${q}%,from_addr.ilike.%${q}%,to_addr.ilike.%${q}%,body_text.ilike.%${q}%`);
    // Deux .or() se combinent en ET : boîte ET recherche.
    const { data, count, error } = await req1;
    if (error) throw error;
    const nonLus: Record<string, number> = {};
    await Promise.all(DOSSIERS.map(async (d) => {
      const { count: c } = await restreindre(filtrer(db.from("emails").select("id", { count: "exact", head: true }).eq("read", false), d));
      nonLus[d] = c ?? 0;
    }));
    return {
      total: count ?? 0, page, par_page: PAGE, non_lus: nonLus, boites: permises, expediteurs: await expediteursDe(a),
      messages: (data ?? []).map((m) => ({ ...m, pieces: Array.isArray(m.attachments) ? m.attachments.length : 0, attachments: undefined })),
    };
  }, EQUIPE);
}
