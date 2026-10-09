import { redirect } from "next/navigation";

// Synonyme : /parlement-européen renvoie vers /pe (Parlement européen).
export default function Page() {
  redirect("/pe");
}
