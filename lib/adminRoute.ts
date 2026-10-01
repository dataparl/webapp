import "server-only";
import { NextResponse } from "next/server";
import { checkAdmin, refus, type Admin, type Role } from "./adminAuth";

// Enveloppe commune des routes d'admin et de webmail : les trois verrous,
// le rôle requis (admin par défaut), puis réponse JSON jamais mise en cache.
export const EQUIPE: Role[] = ["admin", "editeur", "utilisateur"];
export const EDITION: Role[] = ["admin", "editeur"];

export async function avecAdmin(req: Request, fn: (a: Admin) => Promise<unknown>, roles: Role[] = ["admin"]): Promise<NextResponse> {
  const a = await checkAdmin(req);
  if (!a.ok) return refus(a);
  if (!roles.includes(a.role)) return NextResponse.json({ error: "réservé à un autre rôle" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  if (a.doitChangerMdp) return NextResponse.json({ error: "mot de passe à changer", mdp: true }, { status: 403, headers: { "Cache-Control": "no-store" } });
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
