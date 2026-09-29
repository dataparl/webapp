"use client";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "./Porte";

export const dateHeure = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "–";

// Charge une ressource d'admin et permet de la recharger après une action.
export function useRessource<T>(chemin: string, query?: Record<string, string | number | undefined>) {
  const { api } = useAdmin();
  const [data, setData] = useState<T | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const cle = JSON.stringify(query ?? {});
  const recharger = useCallback(async () => {
    try { setErr(null); setData(await api<T>(chemin, { query: JSON.parse(cle) })); }
    catch (e) { setErr((e as Error).message); }
  }, [api, chemin, cle]);
  useEffect(() => { recharger(); }, [recharger]);
  return { data, err, recharger };
}
