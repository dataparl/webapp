import { avecAdmin, EDITION } from "@/lib/adminRoute";
import { authAdmin, dataAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Moniteur = { id: number; friendly_name: string; url: string; status: number; custom_uptime_ratio: string; average_response_time: number };

// UptimeRobot (v2) : moniteurs + ratios d'uptime 1/7/30 jours.
// Clé en lecture seule suffisante : UPTIMEROBOT_API_KEY (variables Vercel).
async function uptimeRobot() {
  const cle = process.env.UPTIMEROBOT_API_KEY;
  if (!cle) return { configure: true as const, moniteurs: [] as Moniteur[] };
  try {
    const r = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "DataParl sante" },
      body: new URLSearchParams({ api_key: cle, format: "json", logs: "0", custom_uptime_ratios: "1-7-30", response_times: "1", response_times_average: "30" }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    const j = (await r.json()) as { stat?: string; monitors?: Moniteur[] };
    if (j.stat !== "ok") throw new Error("réponse invalide");
    return { configure: false as const, moniteurs: j.moniteurs ?? [] };
  } catch (e) {
    return { configure: false as const, erreur: e instanceof Error ? e.message : "inconnue", moniteurs: [] as Moniteur[] };
  }
}

// Sentry : événements reçus sur les dernières 24 h (org dataparl).
// SENTRY_AUTH_TOKEN : Settings → Auth Tokens, scope lecture (org:read, project:read).
async function sentry() {
  const cle = process.env.SENTRY_AUTH_TOKEN;
  if (!cle) return { configure: true as const, projets: [] };
  try {
    const r = await fetch("https://sentry.io/api/0/organizations/dataparl/projects/?statsPeriod=24h", {
      headers: { Authorization: `Bearer ${cle}` },
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = (await r.json()) as { id: string; name: string; slug: string; stats: { "24h": [number, number][] } }[];
    return {
      configure: false as const,
      projets: j.map((p) => ({
        nom: p.name, id: p.id,
        url: `https://sentry.io/organizations/dataparl/issues/?project=${p.id}`,
        evenements_24h: (p.stats?.["24h"] ?? []).reduce((n, [, c]) => n + c, 0),
      })),
    };
  } catch (e) {
    return { configure: false as const, erreur: e instanceof Error ? e.message : "inconnue", projets: [] };
  }
}

export async function GET(req: Request) {
  return avecAdmin(req, async () => {
    // Ping des deux bases Supabase (count, aucune donnée renvoyée).
    const ping = (q: PromiseLike<{ error: { message: string } | null }>) =>
      q.then((x) => (x.error ? { ok: false, detail: x.error.message } : { ok: true })).catch((e) => ({ ok: false, detail: e.message }));
    const [baseData, baseAuth, ur, sent] = await Promise.all([
      ping(dataAdmin().from("ministres").select("id", { head: true, count: "exact" })),
      ping(authAdmin().from("profiles").select("id", { head: true, count: "exact" })),
      uptimeRobot(),
      sentry(),
    ]);
    return { base_data: baseData, base_auth: baseAuth, uptimerobot: ur, sentry: sent, date: new Date().toISOString() };
  }, EDITION);
}
