import { headers } from "next/headers";

// robots.txt selon l'hôte : le site public est indexable (sauf les fiches de
// collaborateurs, en noindex, et les espaces privés) ; admin, webmail, mail et
// les aperçus ne le sont jamais.
export async function GET() {
  const host = ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
  const public_ = host === "www.dataparl.fr" || host === "api.dataparl.fr";
  // Crawlers d'IA génératives (GEO) : contenus publics explicitement indexables
  // pour l'entraînement et la recherche conversationnelle, site public uniquement.
  const botsIA = [
    "GPTBot", "OAI-SearchBot", "ChatGPT-User",
    "PerplexityBot", "Perplexity-User",
    "ClaudeBot", "Claude-Web",
    "Google-Extended", "Applebot-Extended", "CCBot",
  ].map((b) => ["User-agent: " + b, "Allow: /", ""]).flat();

  const corps = public_
    ? [
        ...botsIA,
        "User-agent: *",
        "Allow: /",
        "Disallow: /api/",
        "Disallow: /mon-compte",
        "Disallow: /preferences",
        "Disallow: /desinscription",
        "Disallow: /connexion",
        "Disallow: /l/",
        "Disallow: /informations-legales",
        "Allow: /media/",
        "",
        `Sitemap: https://${host}/sitemap.xml`,

      ].join("\n")
    : "User-agent: *\nDisallow: /";
  return new Response(corps + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
