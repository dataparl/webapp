import { imageOg, TAILLE_OG } from "@/lib/og";
import { mixite, pct, statsElus } from "@/lib/stats";

export const alt = "MixiParl' : la mixité des équipes parlementaires";
export const size = TAILLE_OG;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image() {
  const m = mixite((await statsElus().catch(() => [])).filter((r) => r.chambre !== "europarl"));
  return imageOg({
    surtitre: "MixiParl' · la mixité des équipes", accent: "#B794FF",
    chiffre: m.eligibles ? pct(m.paritaires / m.eligibles) : undefined,
    legende: m.eligibles ? `des équipes parlementaires à parité, et ${m.nonMixtes} équipes non mixtes` : "Les équipes parlementaires sont-elles mixtes ?",
  });
}
