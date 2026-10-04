"use client";

import { useEffect, useState } from "react";

// Bouton « revenir en haut » : flèche sur le côté, n'apparaît qu'après
// avoir défilé. Utile surtout sur mobile où les pages sont longues.
export default function RetourHaut() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const maj = () => setVisible(window.scrollY > 600);
    maj();
    window.addEventListener("scroll", maj, { passive: true });
    return () => window.removeEventListener("scroll", maj);
  }, []);
  return (
    <button
      type="button"
      className="retour-haut"
      aria-label="Revenir en haut de la page"
      title="Revenir en haut"
      data-visible={visible ? "" : undefined}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}
