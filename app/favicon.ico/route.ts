// /favicon.ico : monogramme Σ' servi sur tous les domaines et sous-domaines
// (exclu du proxy, ce handler répond partout). La déclinaison dépend de l'hôte :
//   www. jobs. link. webmail.        Σ' blanc sur bleu encre  #071A41
//   api. media. survey. raw. drive.   Σ' bleu encre sur blanc #FFFFFF
//   admin. mail.                     Σ' blanc sur rouge      #C8102F
const SVG = (fond: string, encre: string, bord?: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${fond}"${bord ? ` stroke="${bord}" stroke-width="3"` : ""}/>
  <path d="M11 15 H43 L28 32 L43 49 H11" fill="none" stroke="${encre}" stroke-width="6.5" stroke-linejoin="miter"/>
  <ellipse cx="52" cy="16.5" rx="3.2" ry="3.4" fill="${encre}"/>
  <polygon points="48.9,16 55.1,16 53.3,9 50.7,9" fill="${encre}"/>
</svg>`;

export async function GET(req: Request) {
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const variant =
    host.startsWith("api.") || host.startsWith("media.") || host.startsWith("survey.") || host.startsWith("raw.") || host.startsWith("drive.")
      ? SVG("#FFFFFF", "#071A41", "#071A41")
      : host.startsWith("admin.") || host.startsWith("mail.")
        ? SVG("#C8102F", "#FFFFFF")
        : SVG("#071A41", "#FFFFFF");
  return new Response(variant, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
