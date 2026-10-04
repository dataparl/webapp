import { z } from "zod";
import { avecAdmin, corps } from "@/lib/adminRoute";
import { balayer, importerJour, statutJORF } from "@/lib/jorfImport";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Balayage du Journal officiel (gouvernement et cabinets ministériels) :
// statut, balayage d'une plage (2017 → aujourd'hui) et relève d'un jour.
// Réservé au module « jorf » (rédaction par défaut).

export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const statut = await statutJORF();
    return statut;
  }, "jorf");
}

const Corps = z.object({
  debut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  jour: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  force: z.boolean().optional(),
  sec: z.number().int().min(10).max(240).optional(),
});

export async function POST(req: Request) {
  return avecAdmin(req, async () => {
    const c = Corps.safeParse(await corps(req));
    if (!c.success) return { error: "requête invalide" };
    const hier = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    if (c.data.jour) return { jour: await importerJour(c.data.jour) };
    const debut = c.data.debut ?? "2017-01-01";
    const fin = c.data.fin ?? hier;
    return await balayer(debut, fin, (c.data.sec ?? 220) * 1000, c.data.force ?? false);
  }, "jorf");
}
