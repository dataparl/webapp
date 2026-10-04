"use client";
import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, ADSENSE_SLOT } from "@/lib/env";

// Bloc publicitaire Google AdSense. Ne rend rien (aucun espace réservé) tant
// que le bloc d'annonces n'est pas créé dans la console AdSense : renseigner
// NEXT_PUBLIC_ADSENSE_SLOT (identifiant numérique du bloc, ex. 1234567890)
// dans les variables d'environnement Vercel. Le script adsbygoogle.js est
// déjà chargé dans app/layout.tsx, avec le consentement (Consent Mode v2).

export default function PubGoogle({ slot, format = "auto" }: { slot?: string; format?: string }) {
  const identifiant = slot ?? ADSENSE_SLOT;
  const pousse = useRef(false);
  useEffect(() => {
    if (!identifiant || pousse.current) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle ?? [];
      w.adsbygoogle.push({});
      pousse.current = true;
    } catch { /* le script peut charger après : AdSense repousse seul */ }
  }, [identifiant]);
  if (!identifiant) return null;
  return (
    <div style={{ margin: "28px 0", minHeight: 90 }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={identifiant}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
