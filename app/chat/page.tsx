"use client";

// Mini App Telegram « DataParl' Chat » : page plein écran ouverte depuis
// Telegram (menu button du bot @dataparl_bot). L'identité Telegram est
// validée côté serveur (initData signé, vérifié dans
// /api/chat-telegram avec le token du bot) : aucun compte DataParl' requis.
// Même moteur que le chat du site (chat.dataparl.fr, dpchat) et mêmes CGU
// (acceptation à chaque ouverture, historique en mémoire uniquement).

import { useState, useRef, useEffect, useCallback } from "react";

const RELAIS_TM = "/api/chat-telegram";
const CGU_URL = "/informations-legales/cgu-chat/tm-bot";

type Message = { role: "user" | "assistant"; content: string };
type TgWebApp = { ready: () => void; expand: () => void; initData: string; platform: string };

// Rendu markdown minimaliste : **gras**, *italique*, [liens](url), titres,
// listes et tableaux — même sous-ensemble que le ChatWidget du site.
function Md({ texte }: { texte: string }) {
  const lignes = texte.split(/\n/);
  const blocs: React.ReactNode[] = [];
  let i = 0;
  let cle = 0;

  const enLigne = (s: string): React.ReactNode[] => {
    const parties = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
    return parties.map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={j}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={j}>{p.slice(1, -1)}</em>;
      const lien = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (lien) return <a key={j} href={lien[2]} target="_blank" rel="noopener noreferrer">{lien[1]}</a>;
      return <span key={j}>{p}</span>;
    });
  };

  while (i < lignes.length) {
    const l = lignes[i].trim();

    if (l.startsWith("|") && l.endsWith("|") && l.length > 2) {
      const lignesTab: string[] = [];
      while (i < lignes.length && lignes[i].trim().startsWith("|")) {
        if (!/^\|[\s:|-]+\|$/.test(lignes[i].trim())) lignesTab.push(lignes[i].trim());
        i++;
      }
      const cellules = (r: string) => r.slice(1, -1).split("|").map((c) => c.trim());
      const entetes = lignesTab.length ? cellules(lignesTab[0]) : [];
      blocs.push(
        <div key={cle++} style={{ overflowX: "auto", margin: "6px 0" }}>
          <table style={{ borderCollapse: "collapse", fontSize: ".85rem", width: "100%" }}>
            <thead>
              <tr>{entetes.map((h, c) => (
                <th key={c} style={{ border: "1px solid var(--line)", background: "var(--bg)", padding: "5px 8px", textAlign: "left", fontWeight: 600 }}>{enLigne(h)}</th>
              ))}</tr>
            </thead>
            <tbody>{lignesTab.slice(1).map((r, ri) => (
              <tr key={ri}>{cellules(r).map((c, ci) => (
                <td key={ci} style={{ border: "1px solid var(--line)", padding: "5px 8px" }}>{enLigne(c)}</td>
              ))}</tr>
            ))}</tbody>
          </table>
        </div>
      );
      continue;
    }

    const titre = l.match(/^(#{2,4})\s+(.*)$/);
    if (titre) {
      blocs.push(<strong key={cle++} style={{ display: "block", margin: "8px 0 2px", fontSize: ".92rem" }}>{enLigne(titre[2])}</strong>);
      i++;
      continue;
    }

    if (/^[-*•]\s+/.test(l) || /^\d+\.\s+/.test(l)) {
      const items: string[] = [];
      while (i < lignes.length && (/^[-*•]\s+/.test(lignes[i].trim()) || /^\d+\.\s+/.test(lignes[i].trim()))) {
        items.push(lignes[i].trim().replace(/^([-*•]|\d+\.)\s+/, ""));
        i++;
      }
      blocs.push(
        <ul key={cle++} style={{ margin: "4px 0", paddingLeft: 18 }}>
          {items.map((it, k) => <li key={k} style={{ marginBottom: 2 }}>{enLigne(it)}</li>)}
        </ul>
      );
      continue;
    }

    if (!l) { i++; continue; }

    blocs.push(<p key={cle++} style={{ margin: "0 0 6px" }}>{enLigne(l)}</p>);
    i++;
  }
  return <>{blocs}</>;
}

export default function PageChat() {
  const [mode, setMode] = useState<"chargement" | "telegram" | "navigateur">("chargement");
  const [cgu, setCgu] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const initDataRef = useRef<string>("");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  // Chargement du SDK Telegram puis détection du mode d'ouverture.
  useEffect(() => {
    const existant = document.querySelector<HTMLScriptElement>('script[data-tg-webapp]');
    const init = () => {
      const tg = (window as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp;
      if (tg?.initData) {
        initDataRef.current = tg.initData;
        tg.ready();
        tg.expand();
        setMode("telegram");
      } else {
        setMode("navigateur");
      }
    };
    if (existant) { init(); return; }
    const s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-web-app.js";
    s.dataset.tgWebapp = "1";
    s.onload = init;
    s.onerror = () => setMode("navigateur");
    document.head.appendChild(s);
  }, []);

  const envoyer = useCallback(async () => {
    const q = input.trim();
    if (!q || busy || !cgu) return;
    setInput("");
    setBusy(true);
    setErreur(null);
    const history = [...messages, { role: "user" as const, content: q }];
    setMessages(history);
    try {
      const res = await fetch(RELAIS_TM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: initDataRef.current, messages: history.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json().catch(() => ({ error: "moteur_indisponible" }));
      if (!res.ok) {
        let msg: string;
        switch (data.error) {
          case "non_configuré":
            msg = "Le Chat n’est pas encore configuré côté serveur (variable TELEGRAM_BOT_TOKEN absente sur Vercel).";
            break;
          case "accès_refusé": {
            const emp = data.empreinte;
            msg = "Impossible de vérifier votre identité Telegram. Fermez et rouvrez la Mini App.";
            // Diagnostic : l'id du token côté serveur — à comparer à
            // l'id du bot dans BotFather (getMe). Un écart désigne un
            // mauvais token dans la variable Vercel.
            if (emp?.token_id) msg += ` (token serveur : bot ${emp.token_id}, ${emp.token_taille} caractères)`;
            break;
          }
          case "session_expirée":
            msg = "Session Telegram expirée. Fermez et rouvrez la Mini App.";
            break;
          case "messages_invalides":
            msg = "Question trop longue. Raccourcissez-la.";
            break;
          case "moteur_indisponible":
            msg = "Le moteur du Chat est indisponible. Réessayez dans quelques minutes.";
            break;
          default:
            msg = `Erreur inconnue (${data.error ?? res.status}). Réessayez plus tard.`;
        }
        setErreur(msg);
        return;
      }
      setMessages([...history, { role: "assistant", content: data.reply ?? "Désolé, une erreur est survenue. Réessayez plus tard." }]);
    } catch {
      setErreur("Connexion au serveur impossible. Réessayez dans un instant.");
    } finally {
      setBusy(false);
    }
  }, [input, busy, cgu, messages]);

  function accepterCgu() {
    setCgu(true);
    setMessages([
      { role: "assistant", content: "Bonjour ! Posez-moi une question sur DataParl’ ou les données parlementaires." },
    ]);
  }

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
      color: "var(--ink)",
      fontFamily: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
    }}>
      <header style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", background: "var(--card)" }}>
        <span style={{ fontFamily: "var(--font-spectral), 'Spectral', Georgia, serif", fontWeight: 700, fontSize: "1.1rem" }}>
          DataParl’ Chat
        </span>
      </header>

      {mode === "chargement" && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: ".9rem" }}>…</div>
      )}

      {mode === "navigateur" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center", fontSize: ".93rem", lineHeight: 1.6 }}>
          <p style={{ margin: 0 }}>Cette page est la Mini App Telegram du Chat DataParl’.</p>
          <p style={{ margin: 0 }}>Sur le web, le chat est disponible via le bouton 💬 en bas de chaque page de dataparl.fr.</p>
          <a href="/" style={{ background: "var(--corail)", color: "var(--sur-corail)", padding: "9px 18px", borderRadius: 6, fontWeight: 600, fontSize: ".9rem", textDecoration: "none" }}>
            Aller au site
          </a>
        </div>
      )}

      {mode === "telegram" && !cgu && (
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, padding: 18, fontSize: ".93rem", lineHeight: 1.55 }}>
          <p style={{ margin: 0 }}>
            Le Chat DataParl’ est un assistant automatisé : ses réponses,
            générées par IA, peuvent contenir des erreurs et ne constituent
            pas une source officielle.
          </p>
          <p style={{ margin: 0 }}>
            Vos questions sont transmises à Mistral AI (UE) pour générer les
            réponses ; les échanges restent en mémoire, vidés à la fermeture.
            Votre identité Telegram sert uniquement à vérifier l’accès : elle
            n’est ni conservée ni associée aux questions.
          </p>
          <p style={{ margin: 0 }}>
            Pour utiliser le Chat, acceptez les{" "}
            <a href={CGU_URL} target="_blank" rel="noopener noreferrer">CGU DataParl’ Chat</a>.
          </p>
          <button
            onClick={accepterCgu}
            style={{ all: "unset", cursor: "pointer", background: "var(--corail)", color: "var(--sur-corail)", padding: "11px 18px", borderRadius: 6, fontWeight: 600, fontSize: ".9rem", textAlign: "center" }}
          >
            J’accepte les CGU
          </button>
        </div>
      )}

      {mode === "telegram" && cgu && (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", fontSize: ".93rem", lineHeight: 1.5 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "var(--ink)" : "var(--card)",
                  color: m.role === "user" ? "var(--bg)" : "var(--ink)",
                  border: m.role === "user" ? "1px solid var(--ink)" : "1px solid var(--line)",
                  padding: m.role === "user" ? "8px 12px" : "10px 12px",
                  borderRadius: "10px",
                  maxWidth: "95%",
                }}
              >
                <Md texte={m.content} />
              </div>
            ))}
            {busy && (
              <div style={{ alignSelf: "flex-start", background: "var(--card)", border: "1px solid var(--line)", color: "var(--muted)", padding: "8px 12px", borderRadius: "10px" }}>…</div>
            )}
            {erreur && (
              <div style={{ alignSelf: "center", color: "var(--muted)", fontSize: ".85rem", textAlign: "center", maxWidth: "90%", lineHeight: 1.45 }}>{erreur}</div>
            )}
            <div ref={endRef} />
          </div>
          <div style={{ display: "flex", borderTop: "1px solid var(--line)", background: "var(--card)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && envoyer()}
              placeholder="Votre question…"
              style={{
                flex: 1, border: "none", padding: "13px 14px", fontSize: ".95rem",
                outline: "none", background: "transparent", color: "var(--ink)", fontFamily: "inherit",
              }}
            />
            <button
              onClick={envoyer}
              disabled={busy}
              style={{
                all: "unset", cursor: busy ? "default" : "pointer",
                background: "var(--corail)", color: "var(--sur-corail)",
                padding: "0 20px", display: "inline-flex", alignItems: "center",
                fontWeight: 600, fontSize: ".9rem", opacity: busy ? 0.6 : 1,
              }}
            >
              Envoyer
            </button>
          </div>
        </>
      )}
    </div>
  );
}
