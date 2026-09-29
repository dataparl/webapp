import { NextResponse } from "next/server";
import { z } from "zod";
import { genererCle, MAX_CLES } from "@/lib/apiKeys";
import { authAdmin } from "@/lib/supabaseAdmin";
import { utilisateur } from "@/lib/userAuth";

export const dynamic = "force-dynamic";

const jourParis = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(new Date());

// GET : mes clés actives et leur consommation du jour.
export async function GET(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "non connecté" }, { status: 401 });
  const db = authAdmin();
  const { data: cles } = await db.from("api_keys").select("id, nom, prefixe, quota_jour, created_at, last_used_at")
    .eq("user_id", user.id).is("revoked_at", null).order("created_at");
  const ids = (cles ?? []).map((c) => c.id);
  const { data: usage } = ids.length
    ? await db.from("api_usage").select("key_id, requetes").in("key_id", ids).eq("jour", jourParis())
    : { data: [] as { key_id: string; requetes: number }[] };
  const parCle = new Map((usage ?? []).map((u) => [u.key_id, u.requetes]));
  return NextResponse.json({ max: MAX_CLES, cles: (cles ?? []).map((c) => ({ ...c, requetes_aujourdhui: parCle.get(c.id) ?? 0 })) });
}

// POST : crée une clé ; la valeur en clair n'est renvoyée qu'ici.
export async function POST(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "non connecté" }, { status: 401 });
  const parsed = z.object({ nom: z.string().trim().min(1).max(60) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "donne un nom à ta clé (60 caractères max)" }, { status: 400 });
  const db = authAdmin();
  const { count } = await db.from("api_keys").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("revoked_at", null);
  if ((count ?? 0) >= MAX_CLES) return NextResponse.json({ error: `${MAX_CLES} clés actives au maximum : révoque-en une d'abord` }, { status: 400 });
  const { cle, prefixe, hash } = await genererCle();
  const { error } = await db.from("api_keys").insert({ user_id: user.id, nom: parsed.data.nom, prefixe, key_hash: hash });
  if (error) return NextResponse.json({ error: "création impossible, réessaie" }, { status: 500 });
  return NextResponse.json({ cle, prefixe });
}

// DELETE ?id= : révoque une de mes clés.
export async function DELETE(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "non connecté" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: "clé inconnue" }, { status: 400 });
  await authAdmin().from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
