import { EnTeteSite, PiedDePage } from "../_components/SiteChrome";
import RetourHaut from "../_components/RetourHaut";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <EnTeteSite />
      <main><div className="wrap">{children}</div></main>
      <PiedDePage />
      <RetourHaut />
    </div>
  );
}
