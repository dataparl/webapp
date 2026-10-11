import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos de DataParl'",
  description: "Qui est derrière DataParl', pourquoi ce site existe, comment il est financé et où nous suivre.",
  alternates: { canonical: "/a-propos" },
};
export const revalidate = 86400;

// Logos des réseaux, en SVG inline (tracés officiels type Simple Icons,
// viewBox 24×24 pour tous — aucune dépendance, aucun traqueur).
function LogoBluesky() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path fill="#0285FF" d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
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
      <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9h3.565v11.452z" />
    </svg>
  );
}
function LogoTelegram() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path fill="#229ED9" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-.594-.39-.209-.605.13-.953.247-.253 1.66-1.584 1.684-1.619.02-.04.033-.18-.066-.254-.1-.074-.286-.022-.41-.006-.176.022-1.27.79-1.899 1.284-.33.26-.612.284-.956.004-.266-.217-.397-.32-.413-.333-.037-.177.164-.177.164l-1.76 1.867s-.227.245.053.366c.258.111.406.169.406.169l.41.13s.876 1.847 1.06 2.163c.186.316.36.21.36.21l.854-.256s1.9-1.896 2.996-3.153c.884-1.014 1.766-2.033 1.85-2.147.066-.09.144-.18.21-.247.043-.043.087-.06.13-.062z" />
    </svg>
  );
}
function LogoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
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
