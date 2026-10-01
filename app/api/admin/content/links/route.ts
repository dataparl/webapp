import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { CODE, destinationValide, genererCode } from "@/lib/liens";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Clic = { code: string; le: string; ip: string | null; pays: string | null; source: string; appareil: string | null };
const compter = (xs: string[]) => Object.entries(xs.reduce<Record<string, number>>((a, x) => { a[x] = (a[x] ?? 0) + 1; return a; }, {}))
  .sort((a, b) => b[1] - a[1]).map(([cle, n]) => ({ cle, n }));

// Liste des liens avec leurs compteurs ; ?code= pour le détail d'un lien.
// Les passages de robots (aperçus de liens des réseaux) sont comptés à part.
export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const db = authAdmin();
    const code = new URL(req.url).searchParams.get("code");
    const { data: liens } = await db.from("liens").select("code, destination, titre, actif, cree_le").order("cree_le", { ascending: false });
    let q = db.from("liens_clics").select("code, le, ip, pays, source, appareil").order("le", { ascending: false }).limit(1000);
    if (code) q = q.eq("code", code);
    const { data: clics } = await q;
    const tous = (clics ?? []) as Clic[];
    const humains = tous.filter((c) => c.appareil !== "robot");
    if (code) {
      const l = (liens ?? []).find((x) => x.code === code);
      if (!l) return erreur(404, "lien introuvable");
      return {
        lien: l, total: humains.length, robots: tous.length - humains.length, plafonne: tous.length >= 1000,
        sources: compter(humains.map((c) => c.source)), pays: compter(humains.map((c) => c.pays ?? "Inconnu")),
        appareils: compter(humains.map((c) => c.appareil ?? "inconnu")), reseaux: new Set(humains.map((c) => c.ip).filter(Boolean)).size,
        jours: compter(humains.map((c) => c.le.slice(0, 10))).sort((a, b) => a.cle.localeCompare(b.cle)).slice(-30),
        derniers: humains.slice(0, 50),
      };
    }
    return {
      // Compteur exact par lien (les lignes lues ci-dessus sont plafonnées par l'API).
      liens: await Promise.all((liens ?? []).map(async (l) => {
        const c = humains.filter((x) => x.code === l.code);
        const { count } = await db.from("liens_clics").select("id", { count: "exact", head: true }).eq("code", l.code).neq("appareil", "robot");
        return { ...l, clics: count ?? c.length, sources: compter(c.map((x) => x.source)).slice(0, 3), dernier: c[0]?.le ?? null };
      })),
    };
  }, "contenu_liens");
}

const Creation = z.object({ destination: z.string().max(2000), titre: z.string().trim().max(120).default(""), code: z.string().trim().toLowerCase().max(40).optional() });

export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Creation.safeParse(await corps(req));
    const destination = p.success ? destinationValide(p.data.destination) : null;
    if (!p.success || !destination) return erreur(400, "destination invalide : une adresse https complète est attendue");
    const code = p.data.code || genererCode();
    if (!CODE.test(code)) return erreur(400, "code invalide : 2 à 40 lettres minuscules, chiffres ou tirets");
    const { error } = await authAdmin().from("liens").insert({ code, destination, titre: p.data.titre, cree_par: a.userId });
    if (error) return erreur(409, error.code === "23505" ? "ce code est déjà pris" : "création impossible");
    await audit(a, "lien.creation", code, { destination });
    return { ok: true, code };
  }, "contenu_liens");
}

const Maj = z.object({ code: z.string().regex(CODE), actif: z.boolean().optional(), titre: z.string().trim().max(120).optional(), destination: z.string().max(2000).optional() });

export async function PATCH(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Maj.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    const { code, destination, ...reste } = p.data;
    const champs: Record<string, unknown> = { ...reste };
    if (destination !== undefined) {
      const d = destinationValide(destination);
      if (!d) return erreur(400, "destination invalide");
      champs.destination = d;
    }
    if (!Object.keys(champs).length) return erreur(400, "rien à modifier");
    await authAdmin().from("liens").update(champs).eq("code", code);
    await audit(a, "lien.modification", code, champs);
    return { ok: true };
  }, "contenu_liens");
}

export async function DELETE(req: Request) {
  return avecAdmin(req, async (a) => {
    const code = new URL(req.url).searchParams.get("code") ?? "";
    if (!CODE.test(code)) return erreur(400, "requête invalide");
    const { error } = await authAdmin().from("liens").delete().eq("code", code);
    if (error) return erreur(409, "ce lien est utilisé par un communiqué");
    await audit(a, "lien.suppression", code);
    return { ok: true };
  }, "contenu_liens");
}
