import { headers } from "next/headers";
import EnteteSiteRoute from "../_components/EnteteSiteRoute";
import PiedDePageRoute from "./jobs/_components/FooterJobs";
import RetourHaut from "../_components/RetourHaut";
import CrayonPage from "../_components/CrayonPage";
import EnqueteInvite from "../_components/EnqueteInvite";
import ChatWidget from "../_components/ChatWidget";

// La réécriture du proxy (jobs.dataparl.fr/ -> /jobs) est transparente :
// usePathname() côté client voit l'URL publique ("/"), jamais le chemin
// interne. L'hôte est donc lu côté serveur et passé en prop.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const hote = ((await headers()).get("host") ?? "").split(":")[0];
  const hoteJobs = hote === "jobs.dataparl.fr";
  return (
    <div className="page">
      <EnteteSiteRoute hoteJobs={hoteJobs} />
      <main><div className="wrap">{children}</div></main>
      <PiedDePageRoute hoteJobs={hoteJobs} />
      <RetourHaut />
      <CrayonPage />
      <EnqueteInvite />
      <ChatWidget />
    </div>
  );
}
