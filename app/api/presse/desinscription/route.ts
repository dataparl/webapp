import { signaturePresseValide } from "@/lib/communication";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const page = (titre: string, texte: string, status = 200) => new Response(
  `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${titre} · DataParl'</title></head>
<body style="margin:0;background:#FFFDF5;font-family:Arial,Helvetica,sans-serif;color:#071A41;text-align:center;padding:80px 16px">
<p style="font-family:Georgia,serif;font-weight:bold;font-size:24px">Data<span style="background:#FFD23F;padding:0 3px">Parl'</span></p>
<h1 style="font-family:Georgia,serif">${titre}</h1><p>${texte}</p><p><a href="https://www.dataparl.fr/presse" style="color:#164DFF">Presse &amp; médias</a></p></body></html>`,
  { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });

// Désinscription du carnet presse (lien signé en pied de communiqué ; POST : un clic, RFC 8058).
async function traiter(req: Request) {
  const u = new URL(req.url).searchParams;
  const email = (u.get("e") ?? "").toLowerCase();
  if (!email || !signaturePresseValide(email, u.get("s") ?? "")) return page("Lien invalide", "Ce lien de désinscription est incomplet. Écrivez à presse@dataparl.fr.", 400);
  // GET : simple confirmation (les messageries ouvrent parfois les liens toutes seules).
  if (req.method === "GET") return page("Ne plus recevoir nos communiqués ?", `<form method="post"><button style="background:#F0444F;color:#fff;border:0;border-radius:6px;padding:12px 20px;font-weight:bold;font-size:16px;cursor:pointer">Confirmer la désinscription</button></form>`);
  await authAdmin().from("presse_contacts").update({ actif: false, desinscrit_le: new Date().toISOString() }).eq("email", email);
  return page("C'est noté", "Vous ne recevrez plus les communiqués de DataParl'.");
}
export const GET = traiter;
export const POST = traiter;
