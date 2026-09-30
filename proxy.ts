import { NextResponse, type NextRequest } from "next/server";

// Routage par sous-domaine (un seul déploiement pour tous les hôtes) :
//   www.cavaparlement.eu    site public ; /api -> api.cavaparlement.eu
//   cavaparlement.eu        -> redirection 308 vers www
//   api.cavaparlement.eu    /v1/* -> /api/v1/* (l'API elle-même)
//                           /connexion servie telle quelle (OAuth PKCE sur la même origine)
//                           /api/* (routes internes des pages) servies telles quelles
//                           tout le reste -> /espace-api/* (site de l'API)
//   admin.cavaparlement.eu  /x -> /admin/x, sauf /connexion et /api/*
//   webmail.cavaparlement.eu /x -> /webmail/x, sauf /connexion et /api/*
//   mail.cavaparlement.eu    /lire/<jeton> (version en ligne des emails), le reste -> www
// Sur admin, webmail et mail : pas d'indexation, pas d'intégration en iframe,
// pas de Referer transmis.
// Tout autre hôte (localhost, aperçus Vercel) : pas de réécriture.

const DOMAINE = "cavaparlement.eu";

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

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const path = req.nextUrl.pathname;

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
