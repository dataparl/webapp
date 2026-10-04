"use client";
import { useEffect, useState } from "react";

// Interstitiel de media.dataparl.fr : ce domaine sert les photos des élus et
// le tableur DataParl' Sheets (/sheets/*, /search). Tout autre chemin affiche
// ce message pendant 15 secondes, puis bascule automatiquement vers la même
// adresse sur www.dataparl.fr (réécriture par proxy.ts, jamais indexée).

const WWW = "https://www.dataparl.fr";
const DUREE = 15;

export default function RedirectionMedia() {
  // Le paramètre n'est lu qu'ici, jamais pendant le prérendu (pas de window
  // au moment du build).
  const [vers, setVers] = useState("/");
  const [reste, setReste] = useState(DUREE);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("vers") ?? "/";
    setVers(c.startsWith("/") && !c.startsWith("//") ? c : "/");
  }, []);

  useEffect(() => {
    if (reste <= 0) return;
    const t = setTimeout(() => {
      setReste((r) => {
        if (r <= 1) {
          window.location.replace(`${WWW}${vers}`);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [reste, vers]);

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
