import { redirect } from "next/navigation";

// Synonyme sans accent : /parlement-europeen renvoie vers /pe (Parlement européen).
export default function Page() {
  redirect("/pe");
}
