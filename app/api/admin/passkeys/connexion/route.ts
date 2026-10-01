import { NextResponse } from "next/server";
import { poserCookieOtp } from "@/lib/adminAuth";
import { authentifier, contexte, effacerDefi, lireDefi, optionsAuthentification, poserDefi } from "@/lib/passkeys";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Connexion de l'équipe par clé d'accès, sans mot de passe : la clé désigne le
// compte. Après vérification, le serveur émet un jeton de connexion à usage
// unique que le navigateur échange contre une session ; l'accès renforcé est
// ouvert en même temps (la clé vaut second facteur).
export async function POST(req: Request) {
  const ctx = contexte(req);
  if (!ctx) return NextResponse.json({ error: "indisponible sur cette adresse" }, { status: 400 });
  // Requête intersites refusée (pas de session pour s'en protéger ici).
  const origine = req.headers.get("origin");
  if (origine !== ctx.origine) return NextResponse.json({ error: "origine refusée" }, { status: 403 });
  const b = (await req.json().catch(() => null)) as { action?: string; reponse?: unknown } | null;
  if (b?.action === "options") {
    const options = await optionsAuthentification(ctx.rpID);
    const res = NextResponse.json({ options }, { headers: { "Cache-Control": "no-store" } });
    poserDefi(res, options.challenge, "");
    return res;
  }
  const defi = lireDefi(req, "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = defi && b?.reponse ? await authentifier(ctx, defi, b.reponse as any) : null;
  if (!userId) return NextResponse.json({ error: "clé d'accès refusée" }, { status: 401 });
  const db = authAdmin();
  const { data: s } = await db.from("staff").select("email, actif, nom").eq("user_id", userId).maybeSingle();
  if (!s?.actif) return NextResponse.json({ error: "compte suspendu ou hors de l'équipe" }, { status: 403 });
  // L'adresse du compte de connexion lui-même (pas celle de la fiche d'équipe).
  const { data: compte } = await db.auth.admin.getUserById(userId);
  if (!compte.user?.email) return NextResponse.json({ error: "connexion impossible" }, { status: 500 });
  const { data, error } = await db.auth.admin.generateLink({ type: "magiclink", email: compte.user.email });
  if (error || !data.properties?.hashed_token || data.user?.id !== userId) return NextResponse.json({ error: "connexion impossible" }, { status: 500 });
  await db.from("admin_audit").insert({ user_id: userId, github_login: s.nom, action: "passkey.connexion", cible: null, details: {} });
  const res = NextResponse.json({ ok: true, jeton: data.properties.hashed_token }, { headers: { "Cache-Control": "no-store" } });
  poserCookieOtp(res, req, userId);
  effacerDefi(res);
  return res;
}
