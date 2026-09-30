"use client";
import { useState } from "react";

// Photo officielle d'un élu (sites des assemblées), avec initiales en secours.
export default function Photo({ src, nom, taille = 112 }: { src?: string | null; nom: string; taille?: number }) {
  const [erreur, setErreur] = useState(false);
  const initiales = nom.split(/\s+/).filter(Boolean).map((m) => m[0]).slice(0, 2).join("").toUpperCase();
  if (!src || erreur) {
    return <span className="photo photo-vide" style={{ width: taille, height: taille }} aria-hidden="true">{initiales}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="photo" src={src} alt={`Photo officielle de ${nom}`} width={taille} height={taille}
      loading="lazy" referrerPolicy="no-referrer" onError={() => setErreur(true)} />
  );
}
