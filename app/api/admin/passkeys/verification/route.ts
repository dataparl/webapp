import { NextResponse } from "next/server";
import { audit, identifierAdmin, poserCookieOtp, refus, tropDEchecs } from "@/lib/adminAuth";
import { authentifier, contexte, effacerDefi, lireDefi, optionsAuthentification, poserDefi } from "@/lib/passkeys";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Second facteur par clé d'accès (à la place du code à 6 chiffres) : la
// session existe déjà, la clé doit appartenir au même compte.
export async function POST(req: Request) {
  const id = await identifierAdmin(req);
  if (!id.ok) return refus(id);
  const ctx = contexte(req);
  if (!ctx) return NextResponse.json({ error: "indisponible sur cette adresse" }, { status: 400 });
  const b = (await req.json().catch(() => null)) as { action?: string; reponse?: unknown } | null;
  if (b?.action === "options") {
    const options = await optionsAuthentification(ctx.rpID, id.userId);
    const res = NextResponse.json({ options }, { headers: { "Cache-Control": "no-store" } });
    poserDefi(res, options.challenge, id.userId);
    return res;
  }
  if (await tropDEchecs(id.userId)) return NextResponse.json({ error: "trop d'essais, réessaie dans 15 minutes" }, { status: 429 });
  const defi = lireDefi(req, id.userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qui = defi && b?.reponse ? await authentifier(ctx, defi, b.reponse as any, id.userId) : null;
  await authAdmin().from("admin_otp_attempts").insert({ user_id: id.userId, succes: !!qui });
  await audit(id, qui ? "passkey.succes" : "passkey.echec");
  if (!qui) return NextResponse.json({ error: "clé d'accès refusée" }, { status: 401 });
  const res = NextResponse.json({ ok: true, duree_s: 900 }, { headers: { "Cache-Control": "no-store" } });
  poserCookieOtp(res, req, id.userId);
  effacerDefi(res);
  return res;
}
