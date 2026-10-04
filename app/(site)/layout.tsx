import { EnTeteSite, PiedDePage } from "../_components/SiteChrome";
import RetourHaut from "../_components/RetourHaut";
import CrayonPage from "../_components/CrayonPage";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <EnTeteSite />
      <main><div className="wrap">{children}</div></main>
      <PiedDePage />
      <RetourHaut />
      <CrayonPage />
    </div>
  );
}
