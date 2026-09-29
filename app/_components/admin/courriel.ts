// Petites fonctions de la webmail, sans dépendance (testées).

export function adresse(s: string | null | undefined): string {
  if (!s) return "";
  const m = s.match(/<([^>]+)>/);
  return (m ? m[1] : s).trim().toLowerCase();
}

export function nomAffiche(s: string | null | undefined): string {
  if (!s) return "";
  const m = s.match(/^\s*"?([^"<]+?)"?\s*<[^>]+>/);
  return m ? m[1] : s;
}

export function listeAdresses(s: string): string[] {
  return s.split(/[,;\s]+/).map((x) => adresse(x)).filter((x) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x));
}

export function prefixer(sujet: string, p: "Re" | "Tr"): string {
  const re = p === "Re" ? /^\s*(re|ré)\s*:/i : /^\s*(tr|fwd?)\s*:/i;
  return re.test(sujet) ? sujet : `${p}: ${sujet}`;
}

export function citer(texte: string): string {
  return texte.split("\n").map((l) => `> ${l}`).join("\n");
}

// Document affiché dans l'iframe (sandbox, sans script) : politique de
// sécurité stricte, images distantes bloquées par défaut (pixels de suivi),
// liens ouverts dans un nouvel onglet.
export function documentLecture(html: string, imagesDistantes: boolean): string {
  const img = imagesDistantes ? "data: cid: https:" : "data: cid:";
  const csp = `default-src 'none'; img-src ${img}; style-src 'unsafe-inline'; font-src data:`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><base target="_blank"><meta name="referrer" content="no-referrer"><style>body{font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#071A41;background:#fff;margin:12px;word-wrap:break-word}img{max-width:100%;height:auto}</style></head><body>${html}</body></html>`;
}
