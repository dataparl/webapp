import { NextResponse } from "next/server";
import { checkAdmin, effacerCookieOtp, identifierAdmin, refus } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// État de l'accès : { github, otp: "ok" | "requis" | "a_enroler" }.
export async function GET(req: Request) {
  const id = await identifierAdmin(req);
  if (!id.ok) return refus(id);
  const c = await checkAdmin(req);
  const otp = c.ok ? "ok" : c.otp ?? "requis";
  return NextResponse.json({ github: id.github, nom: id.github, email: id.email, role: id.role, mdp: id.doitChangerMdp, otp }, { headers: { "Cache-Control": "no-store" } });
}

// Fin de l'accès renforcé (bouton « Verrouiller »).
export async function DELETE(req: Request) {
  const id = await identifierAdmin(req);
  if (!id.ok) return refus(id);
  const res = NextResponse.json({ ok: true });
  effacerCookieOtp(res, req);
  return res;
}
