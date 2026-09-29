import { NextResponse } from "next/server";
import { z } from "zod";
import { SITE_URL } from "@/lib/env";
import { logConsent, tropDeTentatives } from "@/lib/consent";
import { emailConfirmation, sendEmail } from "@/lib/mail";
import { authAdmin } from "@/lib/supabaseAdmin";
import { normalizeEmail, randomToken, sha256 } from "@/lib/tokens";

const Corps = z.object({
  email: z.string().trim().email().max(254),
  frequence: z.enum(["quotidienne", "hebdomadaire"]).default("quotidienne"),
  chambres: z.array(z.enum(["assemblee", "senat", "europarl"])).min(1).max(3),
  consentement: z.literal(true),
  site: z.string().max(200).optional().nullable(),
});

// Toujours la même réponse, que l'adresse soit connue ou non.
const OK = { message: "Merci ! Un email de confirmation vient de t'être envoyé. Pense à regarder dans tes indésirables." };

export async function POST(req: Request) {
  const parsed = Corps.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Vérifie l'adresse email, les chambres choisies et la case de consentement." }, { status: 400 });
  }
  const { frequence, chambres, site } = parsed.data;
  if (site) return NextResponse.json(OK); // robot : on ne fait rien
  if (await tropDeTentatives()) {
    return NextResponse.json({ message: "Trop de tentatives. Réessaie dans une heure." }, { status: 429 });
  }

  const email = normalizeEmail(parsed.data.email);
  const db = authAdmin();
  // Filtres enregistrés dès maintenant, activés à la confirmation.
  await db.from("alert_subscriptions").delete().eq("email", email).eq("active", false);
  await db.from("alert_subscriptions").insert({ email, frequence, chambres, active: false });
  await logConsent(email, "subscribe", "alertes");

  const token = randomToken();
  const { error } = await db.from("newsletter_subscribers").upsert(
    {
      email,
      confirm_token_hash: await sha256(token),
      confirm_expires_at: new Date(Date.now() + 48 * 3600_000).toISOString(),
      source: "site",
    },
    { onConflict: "email" },
  );
  if (error) {
    console.error("inscription", error.message);
    return NextResponse.json({ message: "Une erreur est survenue, réessaie plus tard." }, { status: 500 });
  }

  const mail = emailConfirmation(`${SITE_URL}/alertes/confirmation?token=${encodeURIComponent(token)}`);
  const id = await sendEmail({ to: email, ...mail });
  if (id) {
    await db.from("emails").insert({
      direction: "out", communication_type: "transactionnel", from_addr: "noreply@mail.cavaparlement.eu",
      to_addr: email, subject: mail.subject, message_id: id, folder: "sent",
    });
  }
  return NextResponse.json(OK);
}
