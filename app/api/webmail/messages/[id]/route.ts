import { z } from "zod";
import { audit, type Admin } from "@/lib/adminAuth";
import { avecAdmin, EQUIPE, corps, erreur } from "@/lib/adminRoute";
import { boitesDe, peutVoir } from "@/lib/boites";
import { authAdmin } from "@/lib/supabaseAdmin";
import { completerCorps } from "@/lib/webmail";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function accessible(a: Admin, id: string): Promise<boolean> {
  const boites = boitesDe(a);
  if (!boites) return true;
  const { data } = await authAdmin().from("emails").select("to_addr, cc_addr, from_addr").eq("id", id).maybeSingle();
  return !!data && peutVoir(boites, data);
}
const Id = z.string().uuid();

export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params;
  return avecAdmin(req, async (a) => {
    if (!Id.safeParse(id).success) return erreur(400, "identifiant invalide");
    const db = authAdmin();
    const { data, error } = await db.from("emails").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data || !peutVoir(boitesDe(a), data)) return erreur(404, "message introuvable");
    if (!data.read) await db.from("emails").update({ read: true }).eq("id", id);
    const { data: evts } = data.resend_id
      ? await db.from("email_events").select("type, created_at").eq("message_id", data.resend_id).order("created_at")
      : { data: [] };
    const complet = await completerCorps(data);
    return { message: { ...complet, read: true }, evenements: evts ?? [] };
  }, EQUIPE);
}

const Maj = z.object({
  read: z.boolean().optional(),
  flagged: z.boolean().optional(),
  folder: z.enum(["inbox", "sent", "archive", "trash"]).optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  return avecAdmin(req, async (a) => {
    const p = Maj.safeParse(await corps(req));
    if (!Id.safeParse(id).success || !p.success || !Object.keys(p.data).length) return erreur(400, "requête invalide");
    if (!(await accessible(a, id))) return erreur(404, "message introuvable");
    const champs: Record<string, unknown> = { ...p.data };
    if (p.data.folder) { champs.archived = p.data.folder === "archive"; champs.deleted = p.data.folder === "trash"; }
    await authAdmin().from("emails").update(champs).eq("id", id);
    return { ok: true };
  }, EQUIPE);
}

// Suppression définitive : seulement depuis la corbeille.
export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  return avecAdmin(req, async (a) => {
    if (!Id.safeParse(id).success) return erreur(400, "identifiant invalide");
    const db = authAdmin();
    const { data } = await db.from("emails").select("folder, subject, to_addr, cc_addr, from_addr").eq("id", id).maybeSingle();
    if (!data || !peutVoir(boitesDe(a), data)) return erreur(404, "message introuvable");
    if (data.folder !== "trash") return erreur(409, "place d'abord le message dans la corbeille");
    await db.from("emails").delete().eq("id", id);
    await audit(a, "webmail.suppression", id, { subject: data.subject });
    return { ok: true };
  }, EQUIPE);
}
