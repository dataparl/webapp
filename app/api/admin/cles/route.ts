import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const db = authAdmin();
    const { data: cles, error } = await db.from("api_keys")
      .select("id, user_id, nom, prefixe, quota_jour, created_at, last_used_at, revoked_at")
      .order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    const ids = (cles ?? []).map((c) => c.id as string);
    const users = [...new Set((cles ?? []).map((c) => c.user_id as string))];
    const depuis = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
    const aujourdhui = new Date().toISOString().slice(0, 10);
    const [{ data: usage }, { data: profils }] = await Promise.all([
      ids.length ? db.from("api_usage").select("key_id, jour, requetes").in("key_id", ids).gte("jour", depuis) : Promise.resolve({ data: [] }),
      users.length ? db.from("profiles").select("id, email").in("id", users) : Promise.resolve({ data: [] }),
    ]);
    const email = new Map((profils ?? []).map((p) => [p.id, p.email]));
    return {
      cles: (cles ?? []).map((c) => {
        const u = (usage ?? []).filter((x) => x.key_id === c.id);
        return {
          ...c,
          email: email.get(c.user_id) ?? null,
          requetes_30j: u.reduce((s, x) => s + (x.requetes as number), 0),
          requetes_jour: u.find((x) => x.jour === aujourdhui)?.requetes ?? 0,
        };
      }),
    };
  });
}

const Maj = z.object({
  id: z.string().uuid(),
  quota_jour: z.number().int().min(0).max(1_000_000).optional(),
  revoquer: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Maj.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    const champs: Record<string, unknown> = {};
    if (p.data.quota_jour !== undefined) champs.quota_jour = p.data.quota_jour;
    if (p.data.revoquer) champs.revoked_at = new Date().toISOString();
    if (!Object.keys(champs).length) return erreur(400, "rien à modifier");
    await authAdmin().from("api_keys").update(champs).eq("id", p.data.id);
    await audit(a, p.data.revoquer ? "cle.revocation" : "cle.quota", p.data.id, champs);
    return { ok: true };
  });
}
