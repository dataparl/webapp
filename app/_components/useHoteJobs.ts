"use client";
import { useEffect, useState } from "react";

// Détection du sous-domaine DataParl' Jobs, côté client. La réécriture du
// proxy (jobs.dataparl.fr/ -> /jobs) est transparente : usePathname() voit
// l'URL publique ("/"), jamais le chemin interne. L'hôte était lu dans le
// layout via headers(), ce qui rendait toutes les pages dynamiques (ISR et
// cache CDN désactivés) : la détection se fait maintenant après hydratation,
// sans faire basculer le rendu serveur en dynamique. Sans effet sur
// www.dataparl.fr ; sur jobs.dataparl.fr, l'en-tête et le pied de page
// basculent juste après l'hydratation.
export function useHoteJobs(): boolean {
  const [hoteJobs, setHoteJobs] = useState(false);
  useEffect(() => {
    setHoteJobs(window.location.hostname === "jobs.dataparl.fr");
  }, []);
  return hoteJobs;
}
