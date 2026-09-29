import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
const Id = z.string().uuid();

export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params;
  return avecAdmin(req, async () => {
    if (!Id.safeParse(id).success) return erreur(400, "identifiant invalide");
    const db = authAdmin();
    const { data, error } = await db.from("emails").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return erreur(404, "message introuvable");
    if (!data.read) await db.from("emails").update({ read: true }).eq("id", id);
    const { data: evts } = data.resend_id
      ? await db.from("email_events").select("type, created_at").eq("message_id", data.resend_id).order("created_at")
      : { data: [] };
    return { message: { ...data, read: true }, evenements: evts ?? [] };
  });
}

const Maj = z.object({
  read: z.boolean().optional(),
  flagged: z.boolean().optional(),
  folder: z.enum(["inbox", "sent", "archive", "trash"]).optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  return avecAdmin(req, async () => {
    const p = Maj.safeParse(await corps(req));
    if (!Id.safeParse(id).success || !p.success || !Object.keys(p.data).length) return erreur(400, "requête invalide");
    const champs: Record<string, unknown> = { ...p.data };
    if (p.data.folder) { champs.archived = p.data.folder === "archive"; champs.deleted = p.data.folder === "trash"; }
    await authAdmin().from("emails").update(champs).eq("id", id);
    return { ok: true };
  });
}

// Suppression définitive : seulement depuis la corbeille.
export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  return avecAdmin(req, async (a) => {
    if (!Id.safeParse(id).success) return erreur(400, "identifiant invalide");
    const db = authAdmin();
    const { data } = await db.from("emails").select("folder, subject").eq("id", id).maybeSingle();
    if (!data) return erreur(404, "message introuvable");
    if (data.folder !== "trash") return erreur(409, "place d'abord le message dans la corbeille");
    await db.from("emails").delete().eq("id", id);
    await audit(a, "webmail.suppression", id, { subject: data.subject });
    return { ok: true };
  });
}
