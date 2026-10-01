import type { Metadata } from "next";

export const metadata: Metadata = { title: "Questions fréquentes", alternates: { canonical: "/faq" } };

export default function FAQ() {
  return (
    <>
      <h1>Questions <span className="surligne">fréquentes</span></h1>
      <p className="lead">Cette page arrive bientôt. En attendant, pose ta question via le <a href="/contact">formulaire de contact</a>.</p>
    </>
  );
}
