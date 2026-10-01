import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { aujourdhuiParis, correspond, decaler, lundiDe, messageAlerte, type Abonnement, type MvtAlerte } from "@/lib/alertes";
import { nouveauJetonPreferences } from "@/lib/consent";
import { COLONNES_PUBLIQUES, dataQueryTout } from "@/lib/data";
import { expedier, piedOptIn } from "@/lib/mail";
import { cleElus } from "@/lib/referentiel";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SITE = "https://www.dataparl.fr";

// Envoi des alertes, appelé chaque matin par la tâche planifiée de Vercel
// (vercel.json), après le passage quotidien de la collecte. Quotidien : les
// mouvements d'hier et d'aujourd'hui pas encore envoyés. Le lundi : le
// récapitulatif des 7 jours précédents. Idempotent (table alert_sends).
function autorise(req: Request): boolean {
  const s = process.env.CRON_SECRET ?? "";
  const recu = req.headers.get("authorization") ?? "";
  const attendu = `Bearer ${s}`;
  return !!s && recu.length === attendu.length && timingSafeEqual(Buffer.from(recu), Buffer.from(attendu));
}

type Sub = Abonnement & { email: string };

export async function GET(req: Request) {
  if (!autorise(req)) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  const jour = aujourdhuiParis();
  const lundi = jour === lundiDe(jour);
  const db = authAdmin();

  const [{ data: subs, error }, { data: refus }] = await Promise.all([
    db.from("alert_subscriptions").select("email, frequence, chambres, types, groupes, elus").eq("active", true),
    db.from("communication_preferences").select("email").eq("alertes_enabled", false),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const exclus = new Set((refus ?? []).map((r) => r.email as string));
  const abonnes = ((subs ?? []) as Sub[]).filter((s) => !exclus.has(s.email));
  if (!abonnes.length) return NextResponse.json({ ok: true, jour, envoyes: 0, abonnes: 0 });

  const mvts = await dataQueryTout<MvtAlerte>("mouvements", new URLSearchParams({
    select: `${COLONNES_PUBLIQUES},elu_origine_cle,elu_origine_id`, date_event: `gte.${decaler(jour, -7)}`, order: "date_event.desc,chambre.asc,id.asc",
  }), 0);

  const periodes = [`quotidienne:${jour}`, `quotidienne:${decaler(jour, -1)}`, `hebdomadaire:${jour}`];
  const { data: deja } = await db.from("alert_sends").select("email, periode").in("periode", periodes);
  const envoye = new Set((deja ?? []).map((d) => `${d.email}|${d.periode}`));

  const cacheIds = new Map<string, string[]>();
  const idsDe = async (elus: string[]) => {
    const out = new Set<string>();
    for (const e of elus) {
      if (!cacheIds.has(e)) cacheIds.set(e, await cleElus(e).catch(() => [e]));
      for (const x of cacheIds.get(e)!) out.add(x);
    }
    return out;
  };

  let envoyes = 0;
  const erreurs: string[] = [];
  for (const s of abonnes) {
    const ids = await idsDe(s.elus ?? []);
    const a: Abonnement = { ...s, groupes: s.groupes ?? [], elus: s.elus ?? [] };
    let choisis: MvtAlerte[] = [];
    let nouvelles: string[] = [];
    if (s.frequence === "hebdomadaire") {
      if (!lundi || envoye.has(`${s.email}|hebdomadaire:${jour}`)) continue;
      choisis = mvts.filter((m) => m.date_event < jour && m.date_event >= decaler(jour, -7) && correspond(m, a, ids));
      nouvelles = [`hebdomadaire:${jour}`];
    } else {
      const dates = [decaler(jour, -1), jour].filter((d) => !envoye.has(`${s.email}|quotidienne:${d}`));
      choisis = mvts.filter((m) => dates.includes(m.date_event) && correspond(m, a, ids));
      // Une date n'est marquée envoyée que si elle avait des mouvements.
      nouvelles = [...new Set(choisis.map((m) => `quotidienne:${m.date_event}`))];
    }
    if (!choisis.length) continue;
    try {
      const msg = messageAlerte(choisis, s.frequence, jour);
      const jeton = await nouveauJetonPreferences(s.email);
      const r = await expedier({
        to: [s.email], subject: msg.sujet, titre: msg.titre, corpsHtml: msg.html, text: msg.texte, type: "alerte",
        pied: piedOptIn(`${SITE}/preferences?id=${jeton}`, `${SITE}/desinscription?id=${jeton}`),
        unsubscribeUrl: `${SITE}/api/desinscription?id=${jeton}`,
      });
      if (!r.ok) { erreurs.push(r.error); continue; }
      await db.from("alert_sends").insert(nouvelles.map((periode) => ({ email: s.email, periode, message_id: r.resendId, n_mouvements: choisis.length })));
      envoyes += 1;
    } catch (e) {
      erreurs.push(e instanceof Error ? e.message : String(e));
    }
  }
  return NextResponse.json({ ok: erreurs.length === 0, jour, abonnes: abonnes.length, envoyes, erreurs: erreurs.slice(0, 5) });
}
