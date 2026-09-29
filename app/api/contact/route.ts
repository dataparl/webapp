import { NextResponse } from "next/server";
import { z } from "zod";
import { clientFingerprint } from "@/lib/consent";
import { SUJETS } from "@/lib/contact";
import { CONTACT_INBOX } from "@/lib/env";
import { layoutEmail, sendEmail } from "@/lib/mail";
import { authAdmin } from "@/lib/supabaseAdmin";
import { normalizeEmail } from "@/lib/tokens";

const Corps = z.object({
  prenom: z.string().trim().min(1).max(80),
  nom: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  sujet: z.enum(SUJETS.map((s) => s.v) as [string, ...string[]]),
  message: z.string().trim().min(5).max(5000),
  site: z.string().max(200).optional().nullable(),
});

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  const parsed = Corps.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Vérifie les champs : tous sont obligatoires, avec une adresse email valide." }, { status: 400 });
  const d = parsed.data;
  const ok = NextResponse.json({ message: "Merci, ton message est bien arrivé. On te répond par email." });
  if (d.site) return ok; // robot

  const db = authAdmin();
  const { ipHash } = await clientFingerprint();
  if (ipHash) {
    const depuis = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await db.from("contact_messages").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", depuis);
    if ((count ?? 0) >= 5) return NextResponse.json({ error: "Trop de messages envoyés. Réessaie dans une heure." }, { status: 429 });
  }

  const email = normalizeEmail(d.email);
  const { error } = await db.from("contact_messages").insert({
    prenom: d.prenom, nom: d.nom, email, sujet: d.sujet, message: d.message, ip_hash: ipHash,
  });
  if (error) return NextResponse.json({ error: "Envoi impossible, réessaie plus tard." }, { status: 500 });

  const libelle = SUJETS.find((s) => s.v === d.sujet)?.l ?? d.sujet;
  await sendEmail({
    to: CONTACT_INBOX,
    replyTo: email,
    subject: `[Contact · ${libelle}] ${d.prenom} ${d.nom}`,
    html: layoutEmail(libelle, `<p><strong>${esc(d.prenom)} ${esc(d.nom)}</strong> &lt;${esc(email)}&gt;</p><p style="white-space:pre-wrap;line-height:1.6">${esc(d.message)}</p>`, "Message reçu via le formulaire de contact DataParl'. Réponds directement à cet email."),
    text: `${libelle}\n${d.prenom} ${d.nom} <${email}>\n\n${d.message}`,
  });
  return ok;
}
