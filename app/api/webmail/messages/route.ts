import { avecAdmin, erreur } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const DOSSIERS = ["inbox", "sent", "archive", "trash"] as const;
const PAGE = 50;

export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const u = new URL(req.url).searchParams;
    const dossier = u.get("dossier") ?? "inbox";
    if (!(DOSSIERS as readonly string[]).includes(dossier)) return erreur(400, "dossier inconnu");
    const page = Math.max(Number(u.get("page") ?? 0) || 0, 0);
    const q = (u.get("q") ?? "").trim().replace(/[%,()*"\\]/g, "").slice(0, 80);
    const db = authAdmin();
    let req1 = db.from("emails")
      .select("id, direction, from_addr, to_addr, subject, date, read, flagged, attachments, bounced_at", { count: "exact" })
      .eq("folder", dossier).order("date", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
    if (q) req1 = req1.or(`subject.ilike.%${q}%,from_addr.ilike.%${q}%,to_addr.ilike.%${q}%,body_text.ilike.%${q}%`);
    const { data, count, error } = await req1;
    if (error) throw error;
    const nonLus: Record<string, number> = {};
    await Promise.all(DOSSIERS.map(async (d) => {
      const { count: c } = await db.from("emails").select("id", { count: "exact", head: true }).eq("folder", d).eq("read", false);
      nonLus[d] = c ?? 0;
    }));
    return {
      total: count ?? 0, page, par_page: PAGE, non_lus: nonLus,
      messages: (data ?? []).map((m) => ({ ...m, pieces: Array.isArray(m.attachments) ? m.attachments.length : 0, attachments: undefined })),
    };
  });
}
