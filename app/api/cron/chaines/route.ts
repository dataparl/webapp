import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { aujourdhuiParis, decaler, type MvtAlerte } from "@/lib/alertes";
import { mouvementExclu } from "@/lib/exclusions";
import { COLONNES_PUBLIQUES, dataQueryTout } from "@/lib/data";
import { recapResume, recapTelegram } from "@/lib/chaines";
import { dateLongue } from "@/lib/format";
import { authAdmin } from "@/lib/supabaseAdmin";

// Diffusion du DataParl' Daily vers les chaînes Telegram et WhatsApp, appelée
// chaque matin par la tâche planifiée de Vercel (vercel.json), après le cron
// des alertes email. Contrairement à celui-ci, le contenu est identique pour
// tous : le récapitulatif de tous les mouvements publiés hier et aujourd'hui.
// Idempotent (table alert_sends, périodes « chaine-telegram:… » et
// « chaine-whatsapp:… »). Chaîne non configurée (secret vide) = ignorée.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Secrets optionnels : lus directement — secret() lèverait une erreur pour
// une chaîne pas encore configurée ; on préfère sauter proprement l'envoi.
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID ?? "";
const WA_TOKEN = process.env.WHATSAPP_TOKEN ?? "";
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID ?? "";
const WA_TEMPLATE = process.env.WHATSAPP_TEMPLATE ?? "";

function autorise(req: Request): boolean {
  const s = process.env.CRON_SECRET ?? "";
  const recu = req.headers.get("authorization") ?? "";
  const attendu = `Bearer ${s}`;
  return !!s && recu.length === attendu.length && timingSafeEqual(Buffer.from(recu), Buffer.from(attendu));
}

async function dejaEnvoye(periode: string): Promise<boolean> {
  const { data } = await authAdmin().from("alert_sends").select("id").eq("periode", periode).limit(1);
  return !!data?.length;
}

export async function GET(req: Request) {
  if (!autorise(req)) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  const jour = aujourdhuiParis();
  const periodes = { telegram: `chaine-telegram:${jour}`, whatsapp: `chaine-whatsapp:${jour}` };

  // Mouvements publiés hier et aujourd'hui, mêmes règles que le Daily email :
  // les exclusions temporaires ne sont jamais diffusées.
  const mvts = (await dataQueryTout<MvtAlerte>("mouvements", new URLSearchParams({
    select: `${COLONNES_PUBLIQUES},elu_origine_cle,elu_origine_id`,
    date_event: `gte.${decaler(jour, -1)}`, order: "date_event.desc,chambre.asc,id.asc",
  }), 0)).filter((m) => m.date_event <= jour && !mouvementExclu(m));

  const out: Record<string, unknown> = { jour, mouvements: mvts.length };
  const erreurs: string[] = [];

  // — Telegram : un seul message vers le canal de diffusion.
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT) out.telegram = "non configuré";
  else if (await dejaEnvoye(periodes.telegram)) out.telegram = "déjà diffusé";
  else if (!mvts.length) out.telegram = "rien à diffuser";
  else {
    try {
      const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT, text: recapTelegram(mvts, jour), parse_mode: "HTML",
          link_preview_options: { url: `https://www.dataparl.fr/daily/${jour}` },
        }),
      });
      if (!r.ok) erreurs.push(`Telegram ${r.status} : ${(await r.text()).slice(0, 200)}`);
      else {
        await authAdmin().from("alert_sends").insert({ email: "chaine-telegram", periode: periodes.telegram, n_mouvements: mvts.length });
        out.telegram = "diffusé";
      }
    } catch (e) { erreurs.push(e instanceof Error ? e.message : String(e)); }
  }

  // — WhatsApp : Cloud API, gabarit approuvé (obligatoire hors fenêtre de
  // réponse de 24 h) vers chaque abonné opté-in de /daily/wa.
  if (!WA_TOKEN || !WA_PHONE_ID || !WA_TEMPLATE) out.whatsapp = "non configuré";
  else if (await dejaEnvoye(periodes.whatsapp)) out.whatsapp = "déjà diffusé";
  else if (!mvts.length) out.whatsapp = "rien à diffuser";
  else {
    const { data: abonnes, error: errAbo } = await authAdmin().from("wa_abonnes").select("tel").eq("actif", true);
    if (errAbo) erreurs.push(`wa_abonnes : ${errAbo.message}`);
    else {
      let envoyes = 0;
      const echecs: string[] = [];
      for (const a of (abonnes ?? [])) {
        const r = await fetch(`https://graph.facebook.com/v21.0/${WA_PHONE_ID}/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            messaging_product: "whatsapp", to: a.tel, type: "template",
            template: {
              name: WA_TEMPLATE, language: { code: "fr" },
              components: [{ type: "body", parameters: [
                { type: "text", text: dateLongue(jour) },
                { type: "text", text: recapResume(mvts) },
                { type: "text", text: `https://www.dataparl.fr/daily/${jour}` },
              ] }],
            },
          }),
        });
        if (r.ok) envoyes += 1;
        else echecs.push(`${a.tel} : ${(await r.text()).slice(0, 120)}`);
      }
      await authAdmin().from("alert_sends").insert({ email: "chaine-whatsapp", periode: periodes.whatsapp, n_mouvements: mvts.length });
      out.whatsapp = { envoyes, abonnes: (abonnes ?? []).length, echecs: echecs.slice(0, 5) };
    }
  }

  out.ok = erreurs.length === 0;
  out.erreurs = erreurs.slice(0, 5);
  return NextResponse.json(out);
}
