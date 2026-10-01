import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { dejaServis, destinatairesMailing, envoyerMailing, MAX_DESTINATAIRES, suiviEnvois } from "@/lib/communication";
import { gabarit, texteVersHtml } from "@/lib/gabarit";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Audiences (effectifs) et historique des envois.
export async function GET(req: Request) {
  return avecAdmin(req, async (a) => {
    const [abonnes, comptes, envois] = await Promise.all([destinatairesMailing("abonnes"), destinatairesMailing("comptes"), suiviEnvois("mailing")]);
    return { audiences: { abonnes: abonnes.length, comptes: comptes.length }, comptes_permis: a.role === "admin", max: MAX_DESTINATAIRES, envois: envois.map(({ lecteurs, ...e }) => ({ ...e, lecteurs: lecteurs.length })) };
  }, "communication");
}

const Envoi = z.object({
  action: z.enum(["apercu", "test", "envoyer"]),
  objet: z.string().trim().min(3).max(160), texte: z.string().trim().min(10).max(20000),
  audience: z.enum(["abonnes", "comptes"]),
});

export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Envoi.safeParse(await corps(req));
    if (!p.success) return erreur(400, "un objet et un texte sont nécessaires");
    const d = p.data;
    if (d.action === "apercu") return { html: gabarit({ titre: d.objet, corpsHtml: texteVersHtml(d.texte), pied: "Aperçu." }) };
    if (d.action === "test") {
      const r = await envoyerMailing(a, d, [a.email], true);
      return r.envoyes ? { ok: true, a: a.email } : erreur(502, "l'envoi de test a échoué");
    }
    // Écrire à tous les comptes (message de service, sans désinscription) : administrateurs seulement.
    if (d.audience === "comptes" && a.role !== "admin") return erreur(403, "seul un administrateur peut écrire à tous les comptes");
    const tous = await destinatairesMailing(d.audience);
    if (!tous.length) return erreur(400, "aucun destinataire pour cette audience");
    // Même objet dans les dernières 24 h : on ne réécrit pas à ceux qui l'ont reçu (relance, envoi par lots).
    const servis = await dejaServis("mailing", { objet: d.objet });
    const aServir = tous.filter((e) => !servis.has(e));
    if (!aServir.length) return erreur(409, "tous les destinataires ont déjà reçu ce message");
    const lot = aServir.slice(0, MAX_DESTINATAIRES);
    const r = await envoyerMailing(a, d, lot);
    await audit(a, "mailing.envoi", d.objet, { audience: d.audience, ...r });
    return { ok: true, ...r, restants: aServir.length - lot.length };
  }, "communication");
}
