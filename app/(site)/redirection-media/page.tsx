"use client";
import { useEffect, useState } from "react";

// Interstitiel de media.dataparl.fr : ce domaine sert les photos des élus et
// le tableur DataParl' Sheets (/sheets/*, /search). Tout autre chemin affiche
// ce message pendant 15 secondes, puis bascule automatiquement vers la même
// adresse sur www.dataparl.fr (réécriture par proxy.ts, jamais indexée).

const WWW = "https://www.dataparl.fr";
const DUREE = 15;

export default function RedirectionMedia() {
  const [vers] = useState(() => {
    const c = new URLSearchParams(window.location.search).get("vers") ?? "/";
    // N'accepter que les chemins internes relatifs.
    return c.startsWith("/") && !c.startsWith("//") ? c : "/";
  });
  const [reste, setReste] = useState(DUREE);

  useEffect(() => {
    const t = setInterval(() => {
      setReste((r) => {
        if (r <= 1) {
          clearInterval(t);
          window.location.replace(`${WWW}${vers}`);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [vers]);

  return (
    <div className="etroit">
      <h1>Redirection vers <span className="surligne">DataParl&apos;</span></h1>
      <p className="lead">
        Le domaine <span className="mono">media.dataparl.fr</span> héberge les photos
        des élus et le tableur DataParl&apos; Sheets. Les autres pages de DataParl&apos;
        vivent sur <span className="mono">www.dataparl.fr</span>.
      </p>
      <p className="carte-admin">
        Tu vas être redirigé{reste > 0 ? ` dans ${reste} seconde${reste > 1 ? "s" : ""}` : " maintenant"} vers
        l&apos;adresse <a href={`${WWW}${vers}`}>{WWW}{vers}</a>.
      </p>
      <p>
        <a className="btn" href={`${WWW}${vers}`}>Y aller tout de suite</a>
      </p>
    </div>
  );
}
