import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { aujourdhuiParis, correspond, decaler, lundiDe, messageAlerte, type Abonnement, type MvtAlerte } from "@/lib/alertes";
import { nouveauJetonPreferences } from "@/lib/consent";
import { mouvementExclu } from "@/lib/exclusions";
import { COLONNES_PUBLIQUES, dataQueryTout } from "@/lib/data";
import { prenomNomAdresse } from "@/lib/gabarit";
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

// Heartbeat Better Stack (monitor « Cron alertes ») : signaler que le cron a
// bien tourné. Ping lancé sans attendre la réponse — son échec éventuel
// n'interrompt jamais l'envoi des alertes. Silencieux si l'URL n'est pas
// configurée (variable d'environnement, jamais dans le code : elle contient
// le jeton du heartbeat).
function pingHeartbeat() {
  const url = process.env.BETTERSTACK_HEARTBEAT_URL ?? "";
  if (url) fetch(url, { method: "GET", cache: "no-store" }).catch(() => {});
}

type Sub = Abonnement & { email: string; user_id: string | null; frequence: "quotidienne" | "hebdomadaire"; frequences: ("quotidienne" | "hebdomadaire")[] };

// « Prénom NOM » : les infos du compte (metadata de l'auth), plus rien à saisir.
async function destinataire(s: Sub): Promise<string | undefined> {
  if (!s.user_id) return undefined;
  const { data } = await authAdmin().auth.admin.getUserById(s.user_id);
  const meta = data.user?.user_metadata ?? {};
  if (meta.prenom || meta.nom) return prenomNomAdresse(String(meta.prenom ?? ""), String(meta.nom ?? ""));
  const complet = String(data.user?.user_metadata?.full_name ?? data.user?.user_metadata?.name ?? "").trim();
  if (!complet.includes(" ")) return undefined;
  const mots = complet.split(/\s+/);
  return prenomNomAdresse(mots.slice(0, -1).join(" "), mots[mots.length - 1]);
}

export async function GET(req: Request) {
  if (!autorise(req)) return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  pingHeartbeat();
  const jour = aujourdhuiParis();
  const lundi = jour === lundiDe(jour);
  const db = authAdmin();
