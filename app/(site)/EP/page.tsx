import { redirect } from "next/navigation";

// Synonyme : /EP renvoie vers /pe (Parlement européen).
export default function Page() {
  redirect("/pe");
}
