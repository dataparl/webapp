import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { dataQuery } from "@/lib/data";

// Lien depuis un mouvement (clé du nom) vers la fiche du collaborateur.
export async function GET(req: Request, { params }: { params: Promise<{ cle: string }> }) {
  const { cle } = await params;
  const id = createHash("md5").update(decodeURIComponent(cle)).digest("hex").slice(0, 8);
  const { rows } = await dataQuery<{ slug: string }>("collaborateurs", new URLSearchParams({ select: "slug", collab_id: `eq.${id}` }), 3600).catch(() => ({ rows: [] }));
  const url = new URL(rows[0] ? `/collab/${rows[0].slug}` : "/collab", req.url);
  return NextResponse.redirect(url, 307);
}
