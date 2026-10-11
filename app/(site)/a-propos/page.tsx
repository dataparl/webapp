import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos de DataParl'",
  description: "Qui est derrière DataParl', pourquoi ce site existe, comment il est financé et où nous suivre.",
  alternates: { canonical: "/a-propos" },
};
export const revalidate = 86400;

// Logos des réseaux, en SVG inline (aucune dépendance, aucun traqueur).
function LogoBluesky() {
  return (
    <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
      <path fill="#0285FF" d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" transform="scale(1.1667)" />
    </svg>
  );
}
function LogoX() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function LogoLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 1 1 0 0-4.124 2.062 2.062 0 0 0 0 4.124zM7.119 20.452H3.554V9h3.565v11.452z" />
    </svg>
  );
}
function LogoTelegram() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path fill="#229ED9" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.562 8.162-1.995 9.412c-.15.66-.54.82-1.092.51l-3.016-2.224-1.456 1.402c-.161.161-.296.296-.606.296l.217-3.08 5.608-5.066c.244-.217-.054-.338-.376-.121l-6.932 4.368-2.987-.933c-.649-.203-.66-.649.135-.962l11.374-4.386c.54-.198 1.013.129.826.994Z" />
    </svg>
  );
}
function LogoWhatsApp() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
      <path fill="#25D366" d="M16.04 3.2C9.4 3.2 4.02 8.58 4.02 15.22c0 2.1.55 4.15 1.6 5.96L3.2 28.8l7.81-2.05a12.9 12.9 0 0 0 5.03 1.02h.01c6.63 0 12.02-5.38 12.02-12.02 0-3.21-1.25-6.23-3.52-8.5a11.93 11.93 0 0 0-8.51-3.52Zm0 1.9c2.71 0 5.25 1.05 7.17 2.97a10.06 10.06 0 0 1 2.96 7.17c0 5.58-4.54 10.11-10.13 10.11a11 11 0 0 1-4.6-1.05l-.36-.18-4.2 1.1 1.12-4.1-.21-.37a10.05 10.05 0 0 1-1.54-5.51c0-5.58 4.54-10.12 10.12-10.12Zm-3.2 5.02c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.34.99 2.5c.12.16 1.69 2.68 4.18 3.65 2.06.8 2.48.65 2.93.61.45-.04 1.46-.6 1.66-1.18.2-.58.2-1.07.15-1.18-.06-.1-.22-.16-.46-.28-.24-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.24-.63.8-.77.96-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.94-1.5-.72-.89-1.2-1.99-1.34-2.23-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.56-1.34-.76-1.83-.2-.48-.4-.42-.56-.43h-.48Z" />
    </svg>
  );
}

const RESEAUX = [
  { href: "https://t.me/dataparl_daily", nom: "Telegram", logo: <LogoTelegram /> },
  { href: "https://whatsapp.com/channel/0029VbEDOKCCXC3R26cJIf1P", nom: "WhatsApp (canal)", logo: <LogoWhatsApp /> },
  { href: "https://bsky.app/profile/dataparl.fr", nom: "Bluesky", logo: <LogoBluesky /> },
  { href: "https://x.com/DataParl_fr", nom: "X (Twitter)", logo: <LogoX /> },
  { href: "https://www.linkedin.com/company/dataparl/", nom: "LinkedIn", logo: <LogoLinkedIn /> },
];

export default function APropos() {
  return (
    <div className="etroit">
      <h1>À propos de <span className="surligne">DataParl&apos;</span></h1>
      <p className="lead">
        DataParl&apos; relit chaque matin les listes officielles des collaborateurs parlementaires et reconstitue,
        depuis 2015, qui travaille pour quel élu. Un projet indépendant, transparent et librement réutilisable.
      </p>

      <h2>Pourquoi ce site</h2>
      <p>
        Les équipes des parlementaires sont une pièce mal connue du travail parlementaire : des milliers de
        personnes travaillent dans l&apos;ombre des députés, sénateurs et eurodéputés, sans que rien n&apos;en soit
        publié de façon lisible. DataParl&apos; met ces données au clair : arrivées, départs, transferts,
        parcours reconstitués — avec leur source officielle à chaque fois.
      </p>

      <h2>Comment c&apos;est fait</h2>
      <ul>
        <li>Les données viennent des <strong>listes officielles</strong> publiées par l&apos;Assemblée nationale, le Sénat et le Parlement européen, complétées par les archives publiées au JORF.</li>
        <li>Tout est sourcé : chaque chiffre affiché renvoie à sa source, la <a href="/methode">méthode</a> est publiée en détail et datée.</li>
        <li>Les données sont publiées sous <strong>licence ODbL</strong> : libre réutilisation avec mention.</li>
        <li>Le financement est indépendant : pas de publicité partisane, pas de revente de données nominatives à des fins de ciblage.</li>
      </ul>

      <h2>Nos réseaux sociaux</h2>
      <p>Suivez les mouvements et les nouveautés du site :</p>
      <ul className="reseaux">
        {RESEAUX.map((r) => (
          <li key={r.href}>
            <a href={r.href} target="_blank" rel="noopener noreferrer">
              {r.logo}
              <span>{r.nom}</span>
              <span className="meta">→</span>
            </a>
          </li>
        ))}
      </ul>

      <h2>Nous contacter</h2>
      <p>Une question, une correction, un souhait de réutilisation des données ? <a href="/contact">Écrivez-nous</a>.</p>
    </div>
  );
}
