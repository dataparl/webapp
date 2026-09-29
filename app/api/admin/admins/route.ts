import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return avecAdmin(req, async (a) => {
    const db = authAdmin();
    const [{ data: admins }, { data: totp }] = await Promise.all([
      db.from("admin_users").select("user_id, github_login, created_at").order("created_at"),
      db.from("admin_totp_secrets").select("user_id, active, last_used_at"),
    ]);
    const t = new Map((totp ?? []).map((x) => [x.user_id, x]));
    return {
      moi: a.userId,
      admins: (admins ?? []).map((x) => ({ ...x, totp_actif: !!t.get(x.user_id)?.active, derniere_utilisation: t.get(x.user_id)?.last_used_at ?? null })),
    };
  });
}

const Ajout = z.object({ github_login: z.string().trim().regex(/^[A-Za-z0-9-]{1,39}$/) });

// Ajoute un admin par son login GitHub : la personne doit s'être connectée
// une fois avec GitHub sur DataParl' Auth.
export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Ajout.safeParse(await corps(req));
    if (!p.success) return erreur(400, "login GitHub invalide");
    const cible = p.data.github_login.toLowerCase();
    const db = authAdmin();
    for (let page = 1; page <= 50; page++) {
      const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      for (const u of data.users) {
        const id = (u.identities ?? []).find((i) => i.provider === "github");
        const login = id?.identity_data?.user_name;
        if (typeof login === "string" && login.toLowerCase() === cible) {
          await db.from("admin_users").upsert({ user_id: u.id, github_login: login });
          await audit(a, "admin.ajout", login);
          return { ok: true };
        }
      }
      if (data.users.length < 200) break;
    }
    return erreur(404, "aucun compte DataParl' Auth relié à ce login GitHub : la personne doit d'abord se connecter une fois avec GitHub");
  });
}

const Action = z.object({ user_id: z.string().uuid(), action: z.enum(["retirer", "reinitialiser_totp"]) });

export async function DELETE(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Action.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    if (p.data.user_id === a.userId) return erreur(400, "impossible sur ton propre compte");
    const db = authAdmin();
    await db.from("admin_totp_secrets").delete().eq("user_id", p.data.user_id);
    if (p.data.action === "retirer") await db.from("admin_users").delete().eq("user_id", p.data.user_id);
    await audit(a, p.data.action === "retirer" ? "admin.retrait" : "admin.reinit_totp", p.data.user_id);
    return { ok: true };
  });
}
