"use client";
import { useState } from "react";
import { SUJETS } from "@/lib/contact";

export default function FormulaireContact({ sujetInitial }: { sujetInitial?: string }) {
  const [etat, setEtat] = useState<"idle" | "envoi" | "ok" | "erreur">("idle");
  const [message, setMessage] = useState("");
  const initial = SUJETS.some((s) => s.v === sujetInitial) ? sujetInitial : "question";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    setEtat("envoi");
    const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setEtat(r?.ok ? "ok" : "erreur");
    setMessage(d.message ?? d.error ?? "Envoi impossible, réessaie plus tard.");
  }

  if (etat === "ok") return <p className="ok">{message}</p>;

  return (
    <form onSubmit={onSubmit}>
      <div className="grille-filtres">
        <div>
          <label htmlFor="prenom">Prénom</label>
          <input id="prenom" name="prenom" type="text" required maxLength={80} autoComplete="given-name" />
        </div>
        <div>
          <label htmlFor="nom">Nom</label>
          <input id="nom" name="nom" type="text" required maxLength={80} autoComplete="family-name" />
        </div>
      </div>
      <label htmlFor="email">Adresse email</label>
      <input id="email" name="email" type="email" required autoComplete="email" />
      <label htmlFor="sujet">Sujet</label>
      <select id="sujet" name="sujet" defaultValue={initial}>
        {SUJETS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
      </select>
      <label htmlFor="message">Message</label>
      <textarea id="message" name="message" required minLength={5} maxLength={5000} />
      <input type="text" name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
      <p className="meta">
        Ton message et ton adresse servent uniquement à te répondre. Voir la{" "}
        <a href="/informations-legales/confidentialite">politique de données personnelles</a>.
      </p>
      <button type="submit" disabled={etat === "envoi"}>{etat === "envoi" ? "Envoi…" : "Envoyer"}</button>
      {etat === "erreur" && <p className="erreur">{message}</p>}
    </form>
  );
}
