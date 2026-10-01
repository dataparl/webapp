import { avecAdmin } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
const PAGE = 50;

// Comptes utilisateurs du site (les destinataires possibles d'un mailing).
export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const u = new URL(req.url).searchParams;
    const page = Math.max(Number(u.get("page") ?? 0) || 0, 0);
    const db = authAdmin();
    const { data, error } = await db.auth.admin.listUsers({ page: page + 1, perPage: PAGE });
    if (error) throw error;
    const emails = data.users.map((x) => (x.email ?? "").toLowerCase()).filter(Boolean);
    const [{ data: alertes }, { data: staff }] = await Promise.all([
      emails.length ? db.from("alert_subscriptions").select("email, active, frequence").in("email", emails) : Promise.resolve({ data: [] }),
      db.from("staff").select("user_id, role"),
    ]);
    const al = new Map((alertes ?? []).map((x) => [x.email, x]));
    const st = new Map((staff ?? []).map((x) => [x.user_id, x.role]));
    return {
      total: (data as { total?: number }).total ?? data.users.length, page, par_page: PAGE,
      comptes: data.users.map((x) => ({
        id: x.id, email: x.email ?? "", cree_le: x.created_at, derniere_connexion: x.last_sign_in_at ?? null,
        fournisseurs: (x.app_metadata?.providers as string[] | undefined) ?? [], equipe: st.get(x.id) ?? null,
        alerte: al.get((x.email ?? "").toLowerCase()) ?? null,
      })),
    };
  }, "comptes");
}
