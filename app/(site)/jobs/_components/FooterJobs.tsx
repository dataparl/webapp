import Link from "next/link";

// Pied de page propre à DataParl' Jobs — utilisé sur toutes les pages du module.
export default function FooterJobs() {
  return (
    <footer style={{ marginTop: "56px", paddingTop: "20px", borderTop: "1px solid var(--line)" }}>
      <p style={{ margin: 0 }}>
        © 2026 <strong>DataParl&apos; Jobs</strong> : le Parlement t&apos;attend.
      </p>
      <p className="meta" style={{ margin: "8px 0 0" }}>
        <Link href="/sitemap">Plan du site</Link>
        {" · "}
        <Link href="/informations-legales">Informations légales</Link>
        {" · "}
        <Link href="/informations-legales/cgu-jobs">CGU DataParl&apos; Jobs</Link>
      </p>
    </footer>
  );
}
