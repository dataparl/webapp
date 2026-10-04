import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { oublierCacheFeuilles } from "@/lib/sheetsPublication";
import { FEUILLES } from "@/lib/sheets";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// DataParl' Sheets (www.dataparl.fr/sheets) : quelles feuilles sont publiées en
// libre accès. Une feuille absente de la table (ou publie=false) répond 404.
export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const { data } = await authAdmin().from("sheets_publication").select("id, publie, maj_le");
    const etat = new Map((data ?? []).map((x) => [x.id as string, x]));
    return {
      feuilles: FEUILLES.map((f) => ({
        id: f.id,
        titre: f.titre,
        description: f.description,
        publie: etat.get(f.id)?.publie === true,
        maj_le: (etat.get(f.id)?.maj_le as string | null) ?? null,
      })),
    };
  }, "contenu_sheets");
}

const Maj = z.object({ id: z.string().max(60), publie: z.boolean() });

export async function PATCH(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Maj.safeParse(await corps(req));
    if (!p.success || !FEUILLES.some((f) => f.id === p.data.id)) return erreur(400, "feuille inconnue");
    await authAdmin().from("sheets_publication").upsert({ id: p.data.id, publie: p.data.publie, maj_le: new Date().toISOString(), maj_par: a.userId });
    oublierCacheFeuilles();
    await audit(a, "contenu.sheets", p.data.id, { publie: p.data.publie });
    return { ok: true };
  }, "contenu_sheets");
}
