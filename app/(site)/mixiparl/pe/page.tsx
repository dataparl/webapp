import { redirect } from "next/navigation";

// /mixiparl/pe renvoie vers le classement de la mixité des équipes des députés européens.
export default function Page() {
  redirect("/mixiparl/pe/parlementaires");
}
