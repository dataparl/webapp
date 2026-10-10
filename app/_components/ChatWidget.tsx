"use client";

// DataParl' Chat : pop-up question-réponse, moteur hébergé dans le dépôt
// dataparl/dpchat (relais Mistral + outil dataparl_query sur l'API v1),
// servi sur https://chat.dataparl.fr.
// Style : charte DataParl' via les variables CSS du site (--card, --line,
// --ink, --bleu, --corail, --muted, --radius-card…) — mode nuit inclus.

import { useState, useRef, useEffect } from "react";

const RELAIS = process.env.NEXT_PUBLIC_DPCHAT_URL ?? "https://chat.dataparl.fr/api/chat";

type Message = { role: "user" | "assistant"; content: string };

// Rendu minimaliste du markdown des réponses : **gras**, [liens](url).
function Md({ texte }: { texte: string }) {
  const parties = texte.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parties.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
        const lien = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (lien) return <a key={i} href={lien[2]}>{lien[1]}</a>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Bonjour ! Posez-moi une question sur DataParl' ou les données parlementaires." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);
    const history = [...messages, { role: "user" as const, content: q }];
    setMessages(history);
    try {
      const res = await fetch(RELAIS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      setMessages([
        ...history,
        { role: "assistant", content: data.reply ?? "Désolé, une erreur est survenue. Réessayez plus tard." },
      ]);
    } catch {
      setMessages([
        ...history,
        { role: "assistant", content: "Connexion impossible. Réessayez plus tard." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "72px",
            right: "16px",
            width: "min(380px, calc(100vw - 32px))",
            height: "min(520px, 72vh)",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--line)",
            background: "var(--card)",
            color: "var(--ink)",
            boxShadow: "0 10px 30px rgba(7, 26, 65, .18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 70,
            fontFamily: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontFamily: "var(--font-spectral), 'Spectral', Georgia, serif", fontWeight: 700, fontSize: "1.05rem" }}>
              DataParl' Chat
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer le chat"
              style={{ all: "unset", cursor: "pointer", color: "var(--muted)", fontSize: "1.15rem", lineHeight: 1, padding: "2px 6px" }}
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", fontSize: ".93rem", lineHeight: 1.5 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "var(--ink)" : "var(--bg)",
                  color: m.role === "user" ? "var(--bg)" : "var(--ink)",
                  border: m.role === "user" ? "1px solid var(--ink)" : "1px solid var(--line)",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  maxWidth: "88%",
                  whiteSpace: "pre-wrap",
                }}
              >
                <Md texte={m.content} />
              </div>
            ))}
            {busy && (
              <div style={{ alignSelf: "flex-start", background: "var(--bg)", border: "1px solid var(--line)", color: "var(--muted)", padding: "8px 12px", borderRadius: "10px" }}>
                …
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div style={{ display: "flex", borderTop: "1px solid var(--line)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Votre question…"
              style={{
                flex: 1,
                border: "none",
                padding: "12px 14px",
                fontSize: ".93rem",
                outline: "none",
                background: "transparent",
                color: "var(--ink)",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={send}
              disabled={busy}
              style={{
                all: "unset",
                cursor: busy ? "default" : "pointer",
                background: "var(--corail)",
                color: "var(--sur-corail)",
                padding: "0 18px",
                display: "inline-flex",
                alignItems: "center",
                fontWeight: 600,
                fontSize: ".9rem",
                opacity: busy ? 0.6 : 1,
              }}
            >
              Envoyer
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
        style={{
          position: "fixed",
          right: "16px",
          bottom: "16px",
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "1px solid var(--line)",
          background: "var(--card)",
          cursor: "pointer",
          fontSize: "1.15rem",
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(7, 26, 65, .18)",
          zIndex: 70,
        }}
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}
