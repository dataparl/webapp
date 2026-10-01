"use client";
import { useState } from "react";
import { cheminPhoto, CODE_CHAMBRE, CREDIT } from "@/lib/media";

// Photo officielle d'un élu, servie par DataParl' (media.dataparl.fr), avec
// le crédit de l'assemblée et les initiales en secours.
export default function Photo({ chambre, slug, src, nom, taille = 112 }: { chambre?: string; slug?: string | null; src?: string | null; nom: string; taille?: number }) {
  const [erreur, setErreur] = useState(false);
  const initiales = nom.split(/\s+/).filter(Boolean).map((m) => m[0]).slice(0, 2).join("").toUpperCase();
  const adresse = src && chambre && slug ? cheminPhoto(chambre, slug, taille <= 48 ? 96 : 200) : null;
  if (!adresse || erreur) {
    return <span className="photo photo-vide" style={{ width: taille, height: taille }} aria-hidden="true">{initiales}</span>;
  }
  const credit = `Photo : ${CREDIT[CODE_CHAMBRE[chambre!]]}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="photo" src={adresse} alt={`Photo officielle de ${nom}`} title={credit} width={taille} height={taille}
      loading="lazy" onError={() => setErreur(true)} />
  );
}
