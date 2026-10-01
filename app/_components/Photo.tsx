"use client";
import { useState } from "react";
import { cheminPhoto } from "@/lib/media";

// Photo officielle d'un élu, servie par DataParl' (media.dataparl.fr), avec
// les initiales en secours. Le crédit est dans le nom du fichier (voir les mentions légales).
export default function Photo({ chambre, slug, src, nom, taille = 112 }: { chambre?: string; slug?: string | null; src?: string | null; nom: string; taille?: number }) {
  const [erreur, setErreur] = useState(false);
  const initiales = nom.split(/\s+/).filter(Boolean).map((m) => m[0]).slice(0, 2).join("").toUpperCase();
  const adresse = src && chambre && slug ? cheminPhoto(chambre, slug, taille <= 48 ? 96 : 200) : null;
  if (!adresse || erreur) {
    return <span className="photo photo-vide" style={{ width: taille, height: taille }} aria-hidden="true">{initiales}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="photo" src={adresse} alt={`Photo officielle de ${nom}`} width={taille} height={taille}
      loading="lazy" onError={() => setErreur(true)} />
  );
}
