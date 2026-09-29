import { NextResponse } from "next/server";
import { z } from "zod";
import { identifierAdmin, poserCookieOtp, refus, tropDEchecs, verifierCode } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const Corps = z.object({ code: z.string().trim().regex(/^\d{6}$/) });

export async function POST(req: Request) {
  const id = await identifierAdmin(req);
  if (!id.ok) return refus(id);
  if (await tropDEchecs(id.userId)) return NextResponse.json({ error: "trop d'essais, réessaie dans 15 minutes" }, { status: 429 });
  const p = Corps.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "code à 6 chiffres attendu" }, { status: 400 });
  if (!(await verifierCode(id, p.data.code))) return NextResponse.json({ error: "code invalide" }, { status: 401 });
  const res = NextResponse.json({ ok: true, duree_s: 900 }, { headers: { "Cache-Control": "no-store" } });
  poserCookieOtp(res, req, id.userId);
  return res;
}
