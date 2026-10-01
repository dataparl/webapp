"use client";
import { useEffect, useState } from "react";

// Partage sans pistage : simples liens vers les pages de partage des réseaux
// (aucun script ni cookie tiers), copie du lien, et menu natif sur mobile.
type Props = { url: string; texte: string; titre?: string; compact?: boolean };

const ICONES: Record<string, React.ReactNode> = {
  x: <path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />,
  linkedin: <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.25H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-4.9c0-1.17-.02-2.68-1.63-2.68-1.64 0-1.89 1.28-1.89 2.6V21h-3.88V9.75Z" />,
  bluesky: <path d="M6.3 4.2C8.6 5.9 11 9.4 12 11.4c1-2 3.4-5.5 5.7-7.2 1.7-1.2 4.3-2.2 4.3.8 0 .6-.3 5-.5 5.7-.7 2.5-3.2 3.1-5.5 2.7 4 .7 5 2.9 2.8 5.2-4.2 4.3-6-1.1-6.5-2.5L12 15.8l-.3.3c-.5 1.4-2.3 6.8-6.5 2.5-2.2-2.3-1.2-4.5 2.8-5.2-2.3.4-4.8-.2-5.5-2.7C2.3 10 2 5.6 2 5c0-3 2.6-2 4.3-.8Z" />,
  facebook: <path d="M13.5 21v-7.7h2.6l.4-3h-3V8.4c0-.9.3-1.5 1.6-1.5h1.6V4.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3Z" />,
  lien: <path d="M10.6 13.4a1 1 0 0 1 0-1.4l3-3a1 1 0 1 1 1.4 1.4l-3 3a1 1 0 0 1-1.4 0Zm-2.1 4.9a3.5 3.5 0 0 1-2.5-6l2-2a1 1 0 0 1 1.4 1.4l-2 2a1.5 1.5 0 0 0 2.1 2.1l2-2a1 1 0 1 1 1.4 1.4l-2 2c-.7.7-1.5 1.1-2.4 1.1Zm6.4-4.9a1 1 0 0 1-.7-1.7l2-2a1.5 1.5 0 0 0-2.1-2.1l-2 2a1 1 0 1 1-1.4-1.4l2-2a3.5 3.5 0 0 1 4.9 4.9l-2 2c-.2.2-.4.3-.7.3Z" />,
  partager: <path d="M18 16a3 3 0 0 0-2.4 1.2l-6.7-3.4a3 3 0 0 0 0-1.6l6.7-3.4A3 3 0 1 0 15 7c0 .3 0 .5.1.8L8.4 11.2a3 3 0 1 0 0 3.6l6.7 3.4A3 3 0 1 0 18 16Z" />,
};

const Icone = ({ n }: { n: string }) => <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">{ICONES[n]}</svg>;

export function liensPartage(url: string, texte: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(texte);
  return {
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${texte} ${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  };
}

export default function Partage({ url, texte, titre, compact }: Props) {
  const [copie, setCopie] = useState(false);
  const liens = liensPartage(url, texte);
  const [natif, setNatif] = useState(false); // menu natif : écrans tactiles seulement, après hydratation
  useEffect(() => { setNatif(typeof navigator.share === "function" && !!window.matchMedia?.("(pointer: coarse)").matches); }, []);
  const copier = async () => {
    try { await navigator.clipboard.writeText(url); setCopie(true); setTimeout(() => setCopie(false), 2000); } catch { /* presse-papiers refusé */ }
  };
  return (
    <div className={`partage${compact ? " compact" : ""}`}>
      {!compact && <span className="meta">Partager</span>}
      {natif && (
        <button type="button" className="partage-btn" onClick={() => navigator.share({ title: titre, text: texte, url }).catch(() => {})} aria-label="Partager">
          <Icone n="partager" />
        </button>
      )}
      <a className="partage-btn" href={liens.x} target="_blank" rel="noopener noreferrer" aria-label="Partager sur X"><Icone n="x" /></a>
      <a className="partage-btn" href={liens.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Partager sur LinkedIn"><Icone n="linkedin" /></a>
      <a className="partage-btn" href={liens.bluesky} target="_blank" rel="noopener noreferrer" aria-label="Partager sur Bluesky"><Icone n="bluesky" /></a>
      <a className="partage-btn" href={liens.facebook} target="_blank" rel="noopener noreferrer" aria-label="Partager sur Facebook"><Icone n="facebook" /></a>
      <button type="button" className="partage-btn" onClick={copier} aria-label="Copier le lien">
        <Icone n="lien" />{copie && <span className="partage-ok">Lien copié</span>}
      </button>
    </div>
  );
}
