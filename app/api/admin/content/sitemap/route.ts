import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { oublierCache } from "@/lib/pagesEtat";
import { cheminConnu, PAGES } from "@/lib/pagesRegistre";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Plan du site : toutes les pages publiques et leur état.
export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const { data } = await authAdmin().from("pages_etat").select("chemin, statut, maj_le");
    const etat = new Map((data ?? []).map((x) => [x.chemin as string, x]));
    return { pages: PAGES.map((p) => ({ ...p, statut: (etat.get(p.chemin)?.statut as string | undefined) ?? "active", maj_le: etat.get(p.chemin)?.maj_le ?? null })) };
  }, "contenu_sitemap");
}

const Maj = z.object({ chemin: z.string().max(120), statut: z.enum(["active", "desactivee", "brouillon"]) });

export async function PATCH(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Maj.safeParse(await corps(req));
    if (!p.success || !cheminConnu(p.data.chemin)) return erreur(400, "cette page ne peut pas changer d'état");
    const db = authAdmin();
    if (p.data.statut === "active") await db.from("pages_etat").delete().eq("chemin", p.data.chemin);
    else await db.from("pages_etat").upsert({ chemin: p.data.chemin, statut: p.data.statut, maj_le: new Date().toISOString(), maj_par: a.userId });
    oublierCache();
    await audit(a, "contenu.page", p.data.chemin, { statut: p.data.statut });
    return { ok: true };
  }, "contenu_sitemap");
}
