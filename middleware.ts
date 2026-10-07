import { NextRequest, NextResponse } from "next/server";

// DataParl' Jobs vit sur jobs.dataparl.fr, sans préfixe /jobs dans les URLs :
//   jobs.dataparl.fr/                    → page /jobs
//   jobs.dataparl.fr/proposer            → page /jobs/proposer
//   jobs.dataparl.fr/old-jobs            → page /jobs/old-jobs
//   jobs.dataparl.fr/<uuid>_<offre-slug> → page /jobs/<slug>
// Sur dataparl.fr et www.dataparl.fr, tout /jobs est redirigé (308) vers le
// sous-domaine. Les autres déploiements (previews *.vercel.app) sont neutres.

const JOBS_HOST = "jobs.dataparl.fr";
const HOSTS_WWW = new Set(["dataparl.fr", "www.dataparl.fr"]);
const SLUG_OFFRE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(_|$)/i;

const estJobs = (p: string) => p === "/jobs" || p.startsWith("/jobs/");

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0];
  const { pathname } = req.nextUrl;

  // ——— Sur le sous-domaine : URLs sans /jobs ———
  if (host === JOBS_HOST) {
    // Canonicalisation : un lien interne en /jobs/x repart vers /x.
    if (estJobs(pathname)) {
      const u = req.nextUrl.clone();
      u.pathname = pathname === "/jobs" ? "/" : pathname.slice("/jobs".length) || "/";
      return NextResponse.redirect(u);
    }
    if (pathname === "/") {
      const u = req.nextUrl.clone();
      u.pathname = "/jobs";
      return NextResponse.rewrite(u);
    }
    if (pathname === "/proposer" || pathname === "/old-jobs" || SLUG_OFFRE.test(pathname.slice(1))) {
      const u = req.nextUrl.clone();
      u.pathname = "/jobs" + pathname;
      return NextResponse.rewrite(u);
    }
    return NextResponse.next();
  }

  // ——— Sur dataparl.fr / www : tout /jobs part vers le sous-domaine ———
  if (HOSTS_WWW.has(host) && estJobs(pathname)) {
    const u = req.nextUrl.clone();
    u.protocol = "https:";
    u.host = JOBS_HOST;
    u.pathname = pathname === "/jobs" ? "/" : pathname.slice("/jobs".length) || "/";
    return NextResponse.redirect(u, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)"],
};
