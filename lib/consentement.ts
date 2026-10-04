import { cookieStorage } from "./cookieStorage";

// Consentement Google (Consent Mode v2), piloté par le bandeau du site —
// pas par une bannière Google. Les signaux sont envoyés à GTM et AdSense.
// Les valeurs par défaut (« denied ») sont définies dans app/layout.tsx,
// AVANT le chargement des scripts ; ce module ne fait qu'actualiser l'état.

export type Choix = { mesure: boolean; pub: boolean; date: string };
export const CLE_CONSENTEMENT = "dp_consentement_v1";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Actualise les signaux Consent Mode v2 (et pousse un événement « consentement »,
// utilisable comme déclencheur dans GTM).
function maj(e: Record<string, "granted" | "denied">) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") window.gtag("consent", "update", e);
  else window.dataLayer?.push(["consent", "update", e]);
  window.dataLayer?.push({ event: "consentement", ...e });
}

// Applique un choix complet : mesure d'audience et publicité.
export function appliquer(c: Choix) {
  maj({
    analytics_storage: c.mesure ? "granted" : "denied",
    ad_storage: c.pub ? "granted" : "denied",
    ad_user_data: c.pub ? "granted" : "denied",
    ad_personalization: c.pub ? "granted" : "denied",
  });
}

// Choix mémorisé (null si le visiteur n'a jamais répondu).
export function lire(): Choix | null {
  if (typeof document === "undefined") return null;
  try {
    const brut = cookieStorage.getItem(CLE_CONSENTEMENT);
    if (!brut) return null;
    const j = JSON.parse(brut) as Partial<Choix>;
    if (typeof j.mesure !== "boolean" || typeof j.pub !== "boolean") return null;
    return { mesure: j.mesure, pub: j.pub, date: typeof j.date === "string" ? j.date : "" };
  } catch {
    return null;
  }
}

// Mémorise et applique un choix.
export function enregistrer(c: Choix) {
  if (typeof document === "undefined") return;
  cookieStorage.setItem(CLE_CONSENTEMENT, JSON.stringify(c));
  appliquer(c);
}
