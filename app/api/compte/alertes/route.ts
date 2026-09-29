import { NextResponse } from "next/server";
import { z } from "zod";
import { logConsent } from "@/lib/consent";
import { authAdmin } from "@/lib/supabaseAdmin";
import { normalizeEmail } from "@/lib/tokens";
import { utilisateur } from "@/lib/userAuth";

const Texte = z.string().trim().min(1).max(80).regex(/^[\p{L}\p{N} .'’()-]+$/u);

const Corps = z.object({
  actives: z.boolean(),
  frequence: z.enum(["quotidienne", "hebdomadaire"]),
  chambres: z.array(z.enum(["assemblee", "senat", "europarl"])).min(1).max(3),
  types: z.array(z.enum(["arrivee", "depart", "transfert"])).min(1).max(3),
  groupes: z.array(Texte).max(40).default([]),
  elus: z.array(Texte).max(100).default([]),
  partis: z.array(Texte).max(40).default([]),
  commissions: z.array(Texte).max(40).default([]),
  // Obligatoires pour activer : CGU et consentement à recevoir les emails.
  cgu: z.boolean().optional(),
  consentement: z.boolean().optional(),
});

// L'adresse d'un compte est déjà vérifiée (code email ou fournisseur) :
// l'activation depuis le compte vaut confirmation, sans second email.
export async function PUT(req: Request) {
  const user = await utilisateur(req);
  if (!user) return NextResponse.json({ error: "connexion requise" }, { status: 401 });
  const parsed = Corps.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "choisis au moins une chambre et un type de mouvement" }, { status: 400 });
  const { actives, frequence, chambres, types, groupes, elus, partis, commissions, cgu, consentement } = parsed.data;
  if (actives && !(cgu && consentement)) {
    return NextResponse.json({ error: "accepte les conditions d'utilisation et coche la case de consentement" }, { status: 400 });
  }
  const email = normalizeEmail(user.email!);
  const db = authAdmin();
  const now = new Date().toISOString();

  const valeurs = { email, user_id: user.id, frequence, chambres, types, groupes, elus, partis, commissions, active: actives, updated_at: now };
  const { data: existant } = await db.from("alert_subscriptions").select("id").or(`user_id.eq.${user.id},email.eq.${email}`)
    .order("created_at", { ascending: false });
  if (existant?.length) {
    await db.from("alert_subscriptions").update(valeurs).eq("id", existant[0].id);
    if (existant.length > 1) await db.from("alert_subscriptions").delete().in("id", existant.slice(1).map((s) => s.id));
  } else {
    await db.from("alert_subscriptions").insert(valeurs);
  }
  await db.from("communication_preferences").upsert({ email, alertes_enabled: actives, updated_at: now });
  if (actives) {
    await db.from("newsletter_subscribers").upsert(
      { email, user_id: user.id, confirmed: true, confirmed_at: now, unsubscribed_at: null, confirm_token_hash: null, confirm_expires_at: null, source: "compte" },
      { onConflict: "email" },
    );
    await logConsent(email, "confirm", "alertes");
  } else {
    await db.from("newsletter_subscribers").update({ unsubscribed_at: now }).eq("email", email);
    await logConsent(email, "unsubscribe", "alertes");
  }
  return NextResponse.json({ ok: true });
}
