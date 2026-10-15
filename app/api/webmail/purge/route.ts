import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Purge par domaine, réservée aux admins : compte (dry_run) puis range à la
// corbeille (soft) ou supprime définitivement (hard) tous les messages dont
// l'expéditeur, le destinataire, la copie ou la réponse-à touche le domaine.

const Purge = z.object({
  domain: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/, "domaine invalide"),
  mode: z.enum(["soft", "hard"]),
  dry_run: z.boolean().optional(),
});

export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Purge.safeParse(await corps(req));
    if (!p.success) return erreur(400, "domaine invalide (ex. vercel.com)");
    const { domain, mode, dry_run } = p.data;
    const motif = `%@${domain.replace(/[%,()*"\\]/g, "")}`;
    const filtre = `from_addr.ilike.${motif},to_addr.ilike.${motif},cc_addr.ilike.${motif},reply_to.ilike.${motif}`;
    const db = authAdmin();
    const { count } = await db.from("emails").select("id", { count: "exact", head: true }).or(filtre);
    if (dry_run) return { domain, count: count ?? 0 };
    if (!count) return { domain, count: 0, modifie: 0 };
    const r = mode === "soft"
      ? await db.from("emails").update({ folder: "trash", deleted: true, archived: false }).or(filtre).select("id", { count: "exact" })
      : await db.from("emails").delete().or(filtre).select("id", { count: "exact" });
    if (r.error) throw r.error;
    await audit(a, `webmail.purge.${mode}`, domain, { domain, messages: r.count ?? 0 });
    return { domain, count, modifie: r.count ?? 0 };
  });
}
