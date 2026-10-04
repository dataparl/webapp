// Bios d'élus au format HTML (éditeur « traitement de texte » de l'admin).
// Le champ bios.texte peut être : du HTML produit par l'éditeur (admin.dataparl.fr/elus/edit),
// ou l'ancien format léger (paragraphes, **gras**, intertitres « I. … »).
// Côté site public comme côté API, tout HTML est assaini : liste blanche de balises,
// aucun attribut sauf href (http/https/#), pas de script ni de style.

const BALISES = new Set(["p", "br", "h3", "h4", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "blockquote"]);
// div -> p : les navigateurs insèrent des <div> dans l'éditeur ; on les normalise.
const EQUIVALENTS: Record<string, string> = { div: "p", b: "strong", i: "em" };

// Le texte est-il du HTML produit par l'éditeur ?
export function estHtml(texte: string): boolean {
  return /<\/?(p|h3|h4|strong|b|em|i|u|ul|ol|li|a|br|blockquote)\b/i.test(texte);
}

function attributsSurs(tag: string, attrs: string): string {
  if (tag !== "a") return "";
  const m = attrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const href = (m?.[1] ?? m?.[2] ?? m?.[3] ?? "").trim();
  return /^(https?:\/\/|#|\/|mailto:)/i.test(href) ? ` href="${href.replace(/"/g, "&quot;").replace(/</g, "&lt;")}" rel="noopener noreferrer"` : "";
}

// Assainit du HTML : garde uniquement les balises de la liste blanche, supprime
// scripts, styles, événéments inline et liens dangereux. Le texte hors balises est préservé.
export function assainirHtml(html: string): string {
  let out = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1\s*>/gi, "");
  out = out.replace(/<(\/?)([a-z0-9]+)([^>]*)>/gi, (m, slash, tag, attrs) => {
    const brut = tag.toLowerCase();
    const t = EQUIVALENTS[brut] ?? brut;
    if (!BALISES.has(t)) return "";
    if (slash) return `</${t}>`;
    if (t === "br") return "<br>";
    return `<${t}${attributsSurs(t, attrs)}>`;
  });
  return out;
}

// Ancien format léger -> HTML (pour charger une bio existante dans l'éditeur).
export function markdownLiteVersHtml(texte: string): string {
  const TITRE_SECTION = /^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\.\s+\S/;
  const enligne = (l: string) =>
    l
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
  const blocs = texte.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocs
    .map((b) => {
      if (TITRE_SECTION.test(b)) return `<h3>${enligne(b)}</h3>`;
      const lignes = b.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lignes.every((l) => /^[-•]/.test(l))) {
        return `<ul>${lignes.map((l) => `<li>${enligne(l.replace(/^[-•]\s*/, ""))}</li>`).join("")}</ul>`;
      }
      return `<p>${lignes.map(enligne).join("<br>")}</p>`;
    })
    .join("\n");
}

// Pour l'éditeur : charger n'importe quelle bio existante en HTML propre.
export function bioVersHtml(texte: string | null | undefined): string {
  if (!texte?.trim()) return "";
  return estHtml(texte) ? assainirHtml(texte) : markdownLiteVersHtml(texte);
}
