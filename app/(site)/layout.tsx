import { EnTeteSite, PiedDePage } from "../_components/SiteChrome";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <EnTeteSite />
      <main><div className="wrap">{children}</div></main>
      <PiedDePage />
    </div>
  );
}
