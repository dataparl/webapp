"use client";

// DataParl' Chat : pop-up question-réponse, moteur hébergé dans le dépôt
// dataparl/dpchat (relais Mistral + outil dataparl_query sur l'API v1),
// servi sur https://chat.dataparl.fr.

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
            bottom: "88px",
            right: "20px",
            width: "min(380px, calc(100vw - 40px))",
            height: "min(520px, 70vh)",
            borderRadius: "14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9998,
            background: "#fff",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              background: "#0d3b66",
              padding: "12px 16px",
              fontWeight: 600,
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>DataParl' Chat</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer le chat"
              style={{ background: "transparent", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "#0d3b66" : "#f1f5f9",
                  color: m.role === "user" ? "#fff" : "#111",
                  padding: "8px 12px",
                  borderRadius: 12,
                  maxWidth: "85%",
                  whiteSpace: "pre-wrap",
                  fontSize: 14,
                  lineHeight: 1.45,
                }}
              >
                <Md texte={m.content} />
              </div>
            ))}
            {busy && (
              <div style={{ alignSelf: "flex-start", background: "#f1f5f9", padding: "8px 12px", borderRadius: 12, fontSize: 14, color: "#666" }}>
                …
              </div>
            )}
            <div ref={endRef} />
          </div>
          <div style={{ display: "flex", borderTop: "1px solid #e2e8f0" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Votre question…"
              style={{ flex: 1, border: "none", padding: "12px 14px", fontSize: 14, outline: "none" }}
            />
            <button onClick={send} disabled={busy} style={{ border: "none", background: "#0d3b66", color: "#fff", padding: "0 18px", cursor: busy ? "default" : "pointer", fontSize: 14, opacity: busy ? 0.5 : 1 }}>
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
          bottom: "20px",
          right: "20px",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#0d3b66",
          color: "#fff",
          border: "none",
          fontSize: 24,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          zIndex: 9999,
        }}
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}
