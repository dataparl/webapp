import "server-only";
import { NextResponse } from "next/server";
import { checkAdmin, refus, type Admin } from "./adminAuth";

// Enveloppe commune des routes d'admin et de webmail : les trois verrous,
// puis réponse JSON jamais mise en cache.
export async function avecAdmin(req: Request, fn: (a: Admin) => Promise<unknown>): Promise<NextResponse> {
  const a = await checkAdmin(req);
  if (!a.ok) return refus(a);
  try {
    const out = await fn(a);
    if (out instanceof NextResponse) {
      out.headers.set("Cache-Control", "no-store");
      return out;
    }
    return NextResponse.json(out ?? { ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("admin", e);
    return NextResponse.json({ error: "erreur serveur" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export const erreur = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function corps(req: Request): Promise<unknown> {
  return req.json().catch(() => null);
}
