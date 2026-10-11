"use client";

import { useEffect, useState } from "react";

// Formulaire d'abonnement WhatsApp au Daily (page /daily/wa), et traitement
// du lien de désinscription à un clic (?desinscription=<jeton>).
export default function Inscription({ jetonDesinscription }: { jetonDesinscription?: string }) {
  const [tel, setTel] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [desins, setDesins] = useState<"en cours" | "ok" | "erreur" | null>(jetonDesinscription ? "en cours" : null);

  useEffect(() => {
    if (!jetonDesinscription) return;
    fetch(`/api/chaine-wa?desinscription=${jetonDesinscription}`)
      .then((r) => r.json())
      .then((d) => setDesins(d.desinscrit ? "ok" : "erreur"))
      .catch(() => setDesins("erreur"));
  }, [jetonDesinscription]);

  async function inscrire(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null); setMessage(null); setEnvoi(true);
    try {
      const r = await fetch("/api/chaine-wa", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tel, consent }),
      });
      const d = await r.json();
      if (!r.ok) setErreur(d.error ?? "Inscription impossible pour le moment.");
      else setMessage("C'est noté ! Le prochain Daily arrivera sur WhatsApp. Conserve ce lien de désinscription : https://www.dataparl.fr" + d.desinscription);
    } catch { setErreur("Inscription impossible pour le moment."); }
    setEnvoi(false);
  }

  if (desins) return desins === "ok"
    ? <p>Tu es déinscrit·e du DataParl&apos; Daily WhatsApp : tu ne recevras plus de message.</p>
    : <p className="erreur">Ce lien de désinscription n&apos;est pas ou plus valide.</p>;

  return (
    <form onSubmit={inscrire}>
      <p>
        <input type="tel" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="06 12 34 56 78"
          inputMode="tel" autoComplete="tel" required />
      </p>
      <p>
        <label>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />{" "}
          J&apos;accepte de recevoir le DataParl&apos; Daily chaque matin sur WhatsApp.
        </label>
      </p>
      <p><button disabled={envoi || !consent || tel.length < 8}>{envoi ? "Envoi…" : "Recevoir le Daily"}</button></p>
      {erreur && <p className="erreur">{erreur}</p>}
      {message && <p>{message}</p>}
    </form>
  );
}
