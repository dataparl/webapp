import { NextResponse } from "next/server";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// GET /api/content/page?chemin=/… : contenu enregistré pour une page (s'il
// existe). Lecture publique : c'est la version affichée aux visiteurs.
export async function GET(req: Request) {
  const chemin = new URL(req.url).searchParams.get("chemin") ?? "";
  if (!chemin.startsWith("/") || chemin.length > 200) {
    return NextResponse.json({ html: null }, { status: 400 });
  }
  try {
    const { data } = await authAdmin().from("contenu_pages").select("html").eq("chemin", chemin).maybeSingle();
    return NextResponse.json({ html: (data?.html as string | null) ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ html: null }, { status: 503 });
  }
}
