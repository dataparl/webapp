import crypto from "node:crypto";
import { NextResponse } from "next/server";

// Relais du Chat pour la Mini App Telegram : valide l'identité de
// l'utilisateur via le initData signé par Telegram (HMAC-SHA256 avec le
// token du bot), vérifie la fraîcheur (24 h), puis transmet les messages
// au même moteur que le chat du site (dpchat, chat.dataparl.fr/api/chat).
// Aucune donnée n'est conservée : ni initData, ni questions, ni réponses.

const RELAIS = process.env.DPCHAT_URL ?? "https://chat.dataparl.fr/api/chat";
// Trim : un retour à la ligne au copier-coller de la variable Vercel
// suffirait à faire échouer la vérification de signature.
const TOKEN_BOT = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
const FRAICHEUR_MAX_S = 24 * 3600;

// Validation du initData selon la spécification Telegram :
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
function initDataValide(initData: string): boolean {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return false;
    const dataCheckString = [...params.entries()]
      .filter(([k]) => k !== "hash")
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    const secret = crypto.createHmac("sha256", "WebAppData").update(TOKEN_BOT).digest();
    const calcule = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");
    return calcule === hash;
  } catch {
    return false;
  }
}

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  if (!TOKEN_BOT) {
    return NextResponse.json({ error: "non_configuré" }, { status: 500 });
  }
  let corps: { initData?: string; messages?: Msg[] };
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ error: "requête_invalide" }, { status: 400 });
  }
  const initData = corps.initData ?? "";
  const messages = Array.isArray(corps.messages) ? corps.messages : null;

  if (!initDataValide(initData)) {
    // Diagnostic : l'id numérique du token est public (visible par
    // n'importe qui via getMe) — le renvoyer permet de vérifier à
    // distance que Vercel porte bien le token du bot qui héberge la
    // Mini App, sans jamais exposer le token lui-même.
    return NextResponse.json(
      { error: "accès_refusé", empreinte: { token_id: TOKEN_BOT.split(":")[0] || null, token_taille: TOKEN_BOT.length } },
      { status: 403 },
    );
  }

  // Fraîcheur : le initData doit dater de moins de 24 h (un initData peut
  // être rejoué par son émetteur ; la fenêtre limite ce risque).
  const authDate = Number(new URLSearchParams(initData).get("auth_date") ?? 0);
  if (!authDate || Date.now() / 1000 - authDate > FRAICHEUR_MAX_S) {
    return NextResponse.json({ error: "session_expirée" }, { status: 403 });
  }

  // Même garde-fous que le chat du site : historique borné, dernier
  // message de l'utilisateur, contenu raisonnable.
  if (
    !messages ||
    messages.length < 1 ||
    messages.length > 30 ||
    messages[messages.length - 1].role !== "user" ||
    messages.some((m) => !m.content || m.content.length > 4000)
  ) {
    return NextResponse.json({ error: "messages_invalides" }, { status: 400 });
  }

  const res = await fetch(RELAIS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await res.json().catch(() => ({ reply: null }));
  if (!res.ok) {
    return NextResponse.json({ error: "moteur_indisponible" }, { status: 502 });
  }
  return NextResponse.json({ reply: data.reply ?? null });
}
