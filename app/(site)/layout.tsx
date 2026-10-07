import { EnTeteSite } from "../_components/SiteChrome";
import PiedDePageRoute from "./jobs/_components/FooterJobs";
import RetourHaut from "../_components/RetourHaut";
import CrayonPage from "../_components/CrayonPage";
import EnqueteInvite from "../_components/EnqueteInvite";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <EnTeteSite />
      <main><div className="wrap">{children}</div></main>
      <PiedDePageRoute />
      <RetourHaut />
      <CrayonPage />
      <EnqueteInvite />
    </div>
  );
}
