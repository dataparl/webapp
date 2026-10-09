import { redirect } from "next/navigation";

// Synonyme : /assemblee-nationale renvoie vers /an (Assemblée nationale).
export default function Page() {
  redirect("/an");
}
