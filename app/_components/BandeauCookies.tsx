"use client";
import { useEffect, useState } from "react";
import { cookieStorage } from "@/lib/cookieStorage";

// Bandeau d'information : DataParl' ne dépose que des éléments strictement
// nécessaires (session de connexion). Aucun consentement n'est requis, il n'y
// a donc rien à accepter ni refuser ; on se contente d'informer une fois.
const CLE = "dp_info_cookies_v1";

export default function BandeauCookies() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!cookieStorage.getItem(CLE)) setVisible(true);
  }, []);

  if (!visible) return null;
  const fermer = () => {
    cookieStorage.setItem(CLE, new Date().toISOString().slice(0, 10));
    setVisible(false);
  };

  return (
    <div className="cookies" role="dialog" aria-labelledby="cookies-titre">
      <p className="meta">Pas de cookies en trop ici.</p>
      <p id="cookies-titre" className="titre">Pas de pistage sans ton accord.</p>
      <p>
        DataParl&apos; ne mesure pas l&apos;audience et n&apos;affiche aucune bannière publicitaire. Seul ce qui sert
        à te garder connecté(e) est enregistré. Une vidéo publicitaire n&apos;est chargée que si tu choisis de la
        regarder pour débloquer une fiche collaborateur.
      </p>
      <p><a href="https://www.dataparl.fr/informations-legales/cookies">Lire la politique cookies</a></p>
      <button onClick={fermer}>Compris</button>
    </div>
  );
}
