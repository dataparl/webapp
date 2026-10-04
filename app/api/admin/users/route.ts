import { avecAdmin } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
const PAGE = 50;

// Comptes utilisateurs du site (les destinataires possibles d'un mailing).
// Deux sources, dans l'ordre :
//   1. la vue public.comptes_utilisateurs (PostgREST, rapide) — contournement
//      du 500 GoTrue « Database error finding users » ;
//   2. l'API GoTrue auth.admin.listUsers si la vue n'existe pas encore.

type Compte = {
  id: string; email: string; nom: string; cree_le: string; derniere_connexion: string | null;
  fournisseurs: string[]; equipe: unknown; alerte: unknown;
};

function nomDepuis(meta: Record<string, unknown> | null | undefined): string {
  if (!meta) return "";
  const prenom = typeof meta.prenom === "string" ? meta.prenom : "";
  const nom = typeof meta.nom === "string" ? meta.nom : "";
  const joins = [prenom, nom].filter(Boolean).join(" ");
  if (joins) return joins;
  return String(meta.full_name ?? meta.name ?? "");
}

export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const u = new URL(req.url).searchParams;
    const page = Math.max(Number(u.get("page") ?? 0) || 0, 0);
    const db = authAdmin();

    // 1. La vue PostgREST (si elle existe dans la base AUTH).
    const vue = await db
      .from("comptes_utilisateurs")
      .select("id, email, created_at, last_sign_in_at, user_metadata, app_metadata", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE, page * PAGE + PAGE - 1);
    if (!vue.error) {
      const rows = (vue.data ?? []) as { id: string; email: string; created_at: string; last_sign_in_at: string | null; user_metadata: Record<string, unknown> | null; app_metadata: { providers?: string[] } | null }[];
      return await reponse(db, {
        total: vue.count ?? rows.length,
        users: rows.map((x) => ({
          id: x.id,
          email: (x.email ?? "").toLowerCase(),
          created_at: x.created_at,
          last_sign_in_at: x.last_sign_in_at,
          nom: nomDepuis(x.user_metadata),
          providers: x.app_metadata?.providers ?? ["email"],
        })),
      }, page);
    }
    // Vue absente (code PGRST205) : on retombe sur GoTrue. Toute autre erreur
    // (droits, réseau) est explicite pour ne pas masquer un vrai problème.
    if (!/PGRST205|does not exist|not found/i.test(`${vue.error.message} ${vue.error.code ?? ""}`)) {
      throw new Error(`Vue comptes_utilisateurs : ${vue.error.message}`);
    }

    // 2. L'API GoTrue.
    const { data, error } = await db.auth.admin.listUsers({ page: page + 1, perPage: PAGE });
    if (error) throw new Error(`Supabase Auth (listUsers) : ${error.message}`);
    if (!data?.users) throw new Error("Supabase Auth (listUsers) : réponse vide");
    return await reponse(db, {
      total: (data as { total?: number }).total ?? data.users.length,
      users: data.users.map((x) => ({
        id: x.id,
        email: (x.email ?? "").toLowerCase(),
        created_at: x.created_at,
        last_sign_in_at: x.last_sign_in_at ?? null,
        nom: nomDepuis(x.user_metadata as Record<string, unknown> | undefined),
        providers: (x.app_metadata?.providers as string[] | undefined) ?? ["email"],
      })),
    }, page);
  }, "comptes");
}

// Enrichit les comptes : rôle équipe (staff) et abonnement aux alertes.
async function reponse(db: ReturnType<typeof authAdmin>, liste: { total: number; users: { id: string; email: string; created_at: string; last_sign_in_at: string | null; nom: string; providers: string[] }[] }, page: number) {
  const emails = liste.users.map((x) => x.email).filter(Boolean);
  const [{ data: alertes }, { data: staff }] = await Promise.all([
    emails.length ? db.from("alert_subscriptions").select("email, active, frequence").in("email", emails) : Promise.resolve({ data: [] }),
    db.from("staff").select("user_id, role"),
  ]);
  const al = new Map((alertes ?? []).map((x) => [x.email, x]));
  const st = new Map((staff ?? []).map((x) => [x.user_id, x.role]));
  const comptes: Compte[] = liste.users.map((x) => ({
    id: x.id, email: x.email, nom: x.nom, cree_le: x.created_at, derniere_connexion: x.last_sign_in_at,
    fournisseurs: x.providers, equipe: st.get(x.id) ?? null,
    alerte: al.get(x.email) ?? null,
  }));
  return { total: liste.total, page, par_page: PAGE, comptes };
}
