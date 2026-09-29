import { NextResponse, type NextRequest } from "next/server";

// Routage par sous-domaine (un seul déploiement pour tous les hôtes) :
//   www.cavaparlement.eu    site public ; /api -> api.cavaparlement.eu
//   cavaparlement.eu        -> redirection 308 vers www
//   api.cavaparlement.eu    /v1/* -> /api/v1/* (l'API elle-même)
//                           /connexion servie telle quelle (OAuth PKCE sur la même origine)
//                           /api/* (routes internes des pages) servies telles quelles
//                           tout le reste -> /espace-api/* (site de l'API)
//   admin.cavaparlement.eu  /x -> /admin/x, sauf /connexion
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

  if (host === `admin.${DOMAINE}`) {
    if (path.startsWith("/api/") || path.startsWith("/admin") || path === "/connexion") return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = `/admin${path === "/" ? "" : path}`;
    return NextResponse.rewrite(url);
  }

  if (host === `www.${DOMAINE}`) {
    if (path === "/api" || path === "/api/") return vers(req, `api.${DOMAINE}`, "/", 308);
    if (path.startsWith("/admin")) return vers(req, `admin.${DOMAINE}`, path.replace(/^\/admin/, "") || "/", 307);
    if (path.startsWith("/espace-api")) return vers(req, `api.${DOMAINE}`, path.replace(/^\/espace-api/, "") || "/", 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
