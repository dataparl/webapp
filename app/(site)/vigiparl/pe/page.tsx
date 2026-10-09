import { redirect } from "next/navigation";

// /vigiparl/pe renvoie vers le classement des équipes des députés européens.
export default function Page() {
  redirect("/vigiparl/pe/parlementaires");
}
