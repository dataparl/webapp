import { NextResponse, type NextRequest } from "next/server";

// Routage par sous-domaine (un seul déploiement pour tous les hôtes) :
//   www.cavaparlement.eu    site public
//   cavaparlement.eu        -> redirection 308 vers www
//   api.cavaparlement.eu    /x  -> /api/v1/x
//   admin.cavaparlement.eu  /x  -> /admin/x, sauf /connexion servi tel quel
//                           (le flux OAuth PKCE doit rester sur la même origine)
// Tout autre hôte (localhost, aperçus Vercel) : pas de réécriture.

const DOMAINE = "cavaparlement.eu";

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const url = req.nextUrl.clone();
  const path = url.pathname;

  if (host === DOMAINE) {
    url.host = `www.${DOMAINE}`;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  if (host === `api.${DOMAINE}`) {
    if (path.startsWith("/api/")) return NextResponse.next();
    url.pathname = `/api/v1${path === "/" ? "" : path}`;
    return NextResponse.rewrite(url);
  }

  if (host === `admin.${DOMAINE}`) {
    if (path.startsWith("/api/") || path.startsWith("/admin") || path === "/connexion") return NextResponse.next();
    url.pathname = `/admin${path === "/" ? "" : path}`;
    return NextResponse.rewrite(url);
  }

  if (host === `www.${DOMAINE}` && path.startsWith("/admin")) {
    url.host = `admin.${DOMAINE}`;
    url.port = "";
    url.pathname = path.replace(/^\/admin/, "") || "/";
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
