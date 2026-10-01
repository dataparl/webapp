"use client";
import { useEffect, useState } from "react";

const PHRASES = [
  "Cette page n'existe pas (ou plus). Pas grave, l'hémicycle t'attend.",
  "La page n'a pas été adoptée en commission.",
  "Rejetée en séance publique, faute de quorum.",
  "Amendement irrecevable : la page demandée n'existe pas.",
  "Renvoyée en commission pour un examen plus approfondi.",
  "La navette s'est perdue entre les deux chambres.",
];

// Une formule parlementaire différente à chaque visite (la première au rendu serveur).
export default function PhraseRejetee() {
  const [i, setI] = useState(0);
  useEffect(() => { setI(Math.floor(Math.random() * PHRASES.length)); }, []);
  return <p className="lead" style={{ margin: "0 auto" }}>{PHRASES[i]}</p>;
}
