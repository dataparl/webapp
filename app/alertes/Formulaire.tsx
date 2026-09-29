"use client";
import { useState } from "react";

const CHAMBRES = [
  { v: "assemblee", l: "Assemblée nationale" },
  { v: "senat", l: "Sénat" },
  { v: "europarl", l: "Parlement européen" },
];

export default function FormulaireAlertes() {
  const [etat, setEtat] = useState<"idle" | "envoi" | "ok" | "erreur">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setEtat("envoi");
    const r = await fetch("/api/alertes/inscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: f.get("email"),
        frequence: f.get("frequence"),
        chambres: f.getAll("chambres"),
        consentement: f.get("consentement") === "on",
        site: f.get("site"),
      }),
    }).catch(() => null);
    const data = r ? await r.json().catch(() => ({})) : {};
    setEtat(r?.ok ? "ok" : "erreur");
    setMessage(data.message ?? "Une erreur est survenue, réessayez plus tard.");
  }

  if (etat === "ok") return <p className="ok">{message}</p>;

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="email">Adresse email</label>
      <input id="email" name="email" type="email" required autoComplete="email" />

      <label htmlFor="frequence">Fréquence</label>
      <select id="frequence" name="frequence" defaultValue="quotidienne">
        <option value="quotidienne">Chaque jour où il y a du mouvement</option>
        <option value="hebdomadaire">Un récapitulatif par semaine</option>
      </select>

      <label>Chambres suivies</label>
      {CHAMBRES.map((c) => (
        <label key={c.v} className="check">
          <input type="checkbox" name="chambres" value={c.v} defaultChecked={c.v !== "europarl"} /> {c.l}
        </label>
      ))}

      {/* Champ piège invisible pour les robots */}
      <input type="text" name="site" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />

      <label className="check" style={{ marginTop: 18 }}>
        <input type="checkbox" name="consentement" required />
        <span>J&apos;accepte de recevoir ces alertes par email. Je pourrai me désinscrire à tout moment, en un clic, depuis chaque message.</span>
      </label>

      <button type="submit" disabled={etat === "envoi"}>{etat === "envoi" ? "Envoi…" : "M'inscrire"}</button>
      {etat === "erreur" && <p className="erreur">{message}</p>}
    </form>
  );
}
