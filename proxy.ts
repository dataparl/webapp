import { NextResponse, type NextRequest } from "next/server";
import { cheminsInactifs } from "./lib/pagesEtat";
import { estInactif } from "./lib/pagesRegistre";

// Routage par sous-domaine (un seul déploiement pour tous les hôtes) :
//   www.dataparl.fr         site public ; /api -> api.dataparl.fr
//   dataparl.fr             -> redirection 308 vers www
//   api.dataparl.fr         /v1/* -> /api/v1/* (l'API elle-même)
//                           /connexion servie telle quelle (OAuth PKCE sur la même origine)
//                           /api/* (routes internes des pages) servies telles quelles
//                           tout le reste -> /espace-api/* (site de l'API)
//   admin.dataparl.fr       /x -> /admin/x, sauf /connexion et /api/*
//   webmail.dataparl.fr     /x -> /webmail/x, sauf /connexion et /api/*
//   mail.dataparl.fr        /lire/<jeton> (version en ligne des emails), le reste -> www
//   link.dataparl.fr        /<code> -> /l/<code> (liens tracés), le reste -> www
//   media.dataparl.fr       /<chambre>/<fichier>.png -> /media/… (photos des élus)
// Sur www : une page désactivée dans l'admin (Plan du site) répond 404.
// Anciens domaines (cavaparlement.eu, dataparl.com) : redirection 308 vers la
// même adresse sur dataparl.fr. Exceptions, servies telles quelles pendant la
// transition : /api/* (webhooks, formulaires déjà ouverts) et l'API /v1 sur
// api.cavaparlement.eu (clients existants).
// Sur admin, webmail et mail : pas d'indexation, pas d'intégration en iframe,
// pas de Referer transmis.
// Tout autre hôte (localhost, aperçus Vercel) : pas de réécriture.

const DOMAINE = "dataparl.fr";
const ANCIENS = ["cavaparlement.eu", "dataparl.com"];

// Ancien hôte -> nouvel hôte équivalent, ou null.
function nouvelHote(host: string): string | null {
  for (const ancien of ANCIENS) {
    if (host === ancien) return `www.${DOMAINE}`;
    if (host.endsWith(`.${ancien}`)) return `${host.slice(0, -ancien.length - 1)}.${DOMAINE}`;
  }
  return null;
}

function vers(req: NextRequest, host: string, pathname: string, status: 307 | 308) {
  const url = req.nextUrl.clone();
  url.protocol = "https:";
  url.host = host;
  url.port = "";
  url.pathname = pathname;
  return NextResponse.redirect(url, status);
}

function protege(res: NextResponse): NextResponse {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}

export async function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const path = req.nextUrl.pathname;

  const cible = nouvelHote(host);
  if (cible) {
    if (path.startsWith("/api/")) return NextResponse.next();
    if (host === "api.cavaparlement.eu" && (path === "/v1" || path.startsWith("/v1/"))) {
      const url = req.nextUrl.clone();
      url.pathname = `/api${path}`;
      return NextResponse.rewrite(url);
    }
    return vers(req, cible, path, 308);
  }
  if (host === DOMAINE) return vers(req, `www.${DOMAINE}`, path, 308);

  if (host === `api.${DOMAINE}`) {
    const url = req.nextUrl.clone();
    if (path === "/v1" || path.startsWith("/v1/")) {
      url.pathname = `/api${path}`;
      return NextResponse.rewrite(url);
    }
    if (path.startsWith("/api/") || path === "/connexion" || path.startsWith("/espace-api")) return NextResponse.next();
    url.pathname = `/espace-api${path === "/" ? "" : path}`;
    return NextResponse.rewrite(url);
  }

  // mail.cavaparlement.eu : uniquement les versions en ligne des emails.
  if (host === `mail.${DOMAINE}`) {
    if (path.startsWith("/lire/")) return protege(NextResponse.next());
    return vers(req, `www.${DOMAINE}`, "/", 307);
  }

  // media.dataparl.fr/<chambre>/<fichier> : photos des élus.
  if (host === `media.${DOMAINE}`) {
    if (/^\/(an|senat|pe)\/[^/]+\.png$/.test(path)) {
      const url = req.nextUrl.clone();
      // Ouverture directe dans un navigateur (pas une <img> du site, pas un aperçu
      // de lien) : page de crédit, à la même adresse. Jamais pour une demande d'image.
      const accept = req.headers.get("accept") ?? "";
      let interne = false;
      try { const r = new URL(req.headers.get("referer") ?? ""); interne = r.hostname === DOMAINE || r.hostname.endsWith(`.${DOMAINE}`); } catch { /* pas de Referer */ }
      if (accept.includes("text/html") && !interne) {
        url.pathname = "/photo-credit";
        url.search = `?img=${encodeURIComponent(path.slice(1))}`;
        const res = NextResponse.rewrite(url);
        res.headers.set("Cache-Control", "no-store");
        res.headers.set("X-Robots-Tag", "noindex");
        return res;
      }
      url.pathname = `/media${path}`;
      return NextResponse.rewrite(url);
    }
    if (path.startsWith("/photo-credit")) return vers(req, `www.${DOMAINE}`, "/", 307);
    return vers(req, `www.${DOMAINE}`, path, 307);
  }

  if (host === `link.${DOMAINE}`) {
    if (/^\/[a-z0-9][a-z0-9-]{1,39}$/.test(path)) {
      const url = req.nextUrl.clone();
      url.pathname = `/l${path}`;
      return protege(NextResponse.rewrite(url));
    }
    if (path.startsWith("/l/")) return protege(NextResponse.next());
    return vers(req, `www.${DOMAINE}`, "/", 307);
  }

  for (const espace of ["admin", "webmail"] as const) {
    if (host !== `${espace}.${DOMAINE}`) continue;
    let res: NextResponse;
    if (path.startsWith("/api/") || path.startsWith(`/${espace}`) || path === "/connexion") res = NextResponse.next();
    else {
      const url = req.nextUrl.clone();
      url.pathname = `/${espace}${path === "/" ? "" : path}`;
      res = NextResponse.rewrite(url);
    }
    return protege(res);
  }

  if (host === `www.${DOMAINE}`) {
    if (path === "/api" || path === "/api/") return vers(req, `api.${DOMAINE}`, "/", 308);
    if (path.startsWith("/admin")) return vers(req, `admin.${DOMAINE}`, path.replace(/^\/admin/, "") || "/", 307);
    if (path.startsWith("/webmail")) return vers(req, `webmail.${DOMAINE}`, path.replace(/^\/webmail/, "") || "/", 307);
    if (path.startsWith("/espace-api")) return vers(req, `api.${DOMAINE}`, path.replace(/^\/espace-api/, "") || "/", 308);
  }

  // Pages désactivées ou en brouillon (site public et environnements de test).
  if (!path.startsWith("/api/") && !path.startsWith("/admin") && !path.startsWith("/webmail") && path !== "/" && !path.startsWith("/media/") && !/\.[a-z0-9]{2,5}$/i.test(path)) {
    if (estInactif(path, await cheminsInactifs())) {
      const url = req.nextUrl.clone();
      url.pathname = "/page-desactivee";
      return NextResponse.rewrite(url, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
