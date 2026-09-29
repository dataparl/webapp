"use client";
import { useEffect, useState } from "react";

// Bandeau d'information : DataParl' ne dépose que des éléments strictement
// nécessaires (session de connexion). Aucun consentement n'est requis, il n'y
// a donc rien à accepter ni refuser ; on se contente d'informer une fois.
const CLE = "dp_info_cookies_v1";

export default function BandeauCookies() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CLE)) setVisible(true);
    } catch {
      // stockage indisponible (navigation privée stricte) : on n'insiste pas
    }
  }, []);

  if (!visible) return null;
  const fermer = () => {
    try { localStorage.setItem(CLE, new Date().toISOString()); } catch {}
    setVisible(false);
  };

  return (
    <div className="cookies" role="dialog" aria-labelledby="cookies-titre">
      <p className="meta">Pas de cookies en trop ici.</p>
      <p id="cookies-titre" className="titre">Zéro pub, zéro pistage.</p>
      <p>
        DataParl&apos; ne dépose aucun cookie publicitaire ni de mesure d&apos;audience. Seul ce qui sert à te garder
        connecté(e) est enregistré sur ton appareil.
      </p>
      <p><a href="https://www.cavaparlement.eu/informations-legales/cookies">Lire la politique cookies</a></p>
      <button onClick={fermer}>Compris</button>
    </div>
  );
}
