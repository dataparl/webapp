import { avecAdmin } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    const { data, error } = await authAdmin().from("admin_audit").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    return { journal: data };
  }, "journal");
}
