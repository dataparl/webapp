import { NextResponse } from "next/server";
import { appareilDe, CODE, masquerIp, sourceDe } from "@/lib/liens";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Lien tracé avec chemin : /l/<code>/<chemin…> — le code porte le tracking
// (daily, daily-x, daily-bsky…), le reste de l'adresse est ajouté à la
// destination du lien. Ex. /l/daily/2026-10-06 avec daily → /daily/ redirige
// vers /daily/2026-10-06. Les paramètres utm_* explicites sont transmis.
// Tolérance : un préfixe « /l/ » doublé (/l/l/<code>/…, publié par erreur
// par l'automate du Daily les 6-7 octobre 2026) est ramené à /l/<code>/…
// pour que les posts déjà en ligne continuent de mener au bon endroit.
export async function GET(req: Request, { params }: { params: Promise<{ code: string; chemin: string[] }> }) {
  let { code, chemin } = await params;
  if (code === "l" && chemin.length && CODE.test(chemin[0])) {
    code = chemin[0];
    chemin = chemin.slice(1);
  }
  const accueil = NextResponse.redirect("https://www.dataparl.fr/", 302);
  if (!CODE.test(code) || !chemin.length) return accueil;
  const db = authAdmin();
  const { data } = await db.from("liens").select("destination, actif").eq("code", code).maybeSingle();
  if (!data?.actif) return accueil;
  const u = new URL(req.url);
  const h = req.headers;
  {
    const { error } = await db.from("liens_clics").insert({
      code, ip: masquerIp(h.get("x-forwarded-for")), pays: h.get("x-vercel-ip-country"),
      source: sourceDe(h.get("referer"), u.searchParams.get("utm_source")), referent: (h.get("referer") ?? "").slice(0, 300) || null,
      utm_source: u.searchParams.get("utm_source")?.slice(0, 60) ?? null, appareil: appareilDe(h.get("user-agent")),
    });
    if (error) console.error("lien tracé", error.message);
  }
  let destination: URL;
  try {
    destination = new URL(data.destination as string);
  } catch {
    return accueil;
  }
  // Le chemin partagé remplace le chemin de la destination, les paramètres
  // d'URL de la destination sont conservés.
  destination.pathname = destination.pathname.replace(/\/$/, "") + "/" + chemin.map(encodeURIComponent).join("/");
  const utm = (["utm_source", "utm_medium", "utm_campaign"] as const)
    .map((k) => [k, u.searchParams.get(k)] as const)
    .filter(([, v]) => v);
  for (const [k, v] of utm) destination.searchParams.set(k, (v as string).slice(0, 120));
  return NextResponse.redirect(destination.toString(), { status: 302, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex", "Referrer-Policy": "no-referrer" } });
}
