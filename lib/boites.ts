import "server-only";
import type { Admin } from "./adminAuth";
import { EXPEDITEURS } from "./env";
import { authAdmin } from "./supabaseAdmin";

// Boîtes visibles dans la webmail selon le rôle :
//   admin       toutes (null) ;
//   editeur     la sienne et les adresses communes (hello@, contact@, presse@, rgpd@) ;
//   utilisateur la sienne seulement.
export const COMMUNES = EXPEDITEURS.filter((e) => e.endsWith("@dataparl.fr") && !e.startsWith("noreply@"));

export function boitesDe(a: Admin): string[] | null {
  if (a.role === "admin") return null;
  return [...new Set([a.email, ...(a.modules.includes("boites_communes") ? COMMUNES : [])].filter(Boolean).map((x) => x.toLowerCase()))];
}

const nettoyer = (e: string) => e.replace(/[%,()*"\\]/g, "");

// Filtre PostgREST « l'une de ces adresses en expéditeur, destinataire ou copie ».
export function filtreBoites(boites: string[]): string {
  return boites.flatMap((b) => [`to_addr.ilike.%${nettoyer(b)}%`, `cc_addr.ilike.%${nettoyer(b)}%`, `from_addr.ilike.%${nettoyer(b)}%`]).join(",");
}

export function peutVoir(boites: string[] | null, m: { to_addr?: string | null; cc_addr?: string | null; from_addr?: string | null }): boolean {
  if (!boites) return true;
  const champ = `${m.to_addr ?? ""} ${m.cc_addr ?? ""} ${m.from_addr ?? ""}`.toLowerCase();
  return boites.some((b) => champ.includes(b));
}

// Adresses d'expédition permises : un admin écrit depuis les adresses communes
// et celles de l'équipe ; les autres depuis les boîtes qu'ils voient.
export async function expediteursDe(a: Admin): Promise<string[]> {
  const boites = boitesDe(a);
  if (boites) return boites.filter((b) => b.endsWith("@dataparl.fr") || EXPEDITEURS.includes(b));
  const { data } = await authAdmin().from("staff").select("email").eq("actif", true);
  return [...new Set([...EXPEDITEURS, ...(data ?? []).map((s) => (s.email as string).toLowerCase())])];
}
