export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <main><div className="wrap">{children}</div></main>
    </div>
  );
}
