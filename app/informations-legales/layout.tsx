export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal etroit">
      <p className="meta"><a href="/informations-legales">Informations légales</a></p>
      {children}
    </div>
  );
}
