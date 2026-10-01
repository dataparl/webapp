import { ImageResponse } from "next/og";

// Images de partage (Open Graph) : fond bleu nuit, le chiffre en grand.
export const TAILLE_OG = { width: 1200, height: 630 };

type Carte = { surtitre: string; chiffre?: string; legende: string; accent?: string };

export function imageOg({ surtitre, chiffre, legende, accent = "#FFD23F" }: Carte): ImageResponse {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#14224e", color: "#ffffff", padding: "64px 72px" }}>
        <div style={{ display: "flex", fontSize: 34, color: "#C9D2EA", letterSpacing: 1 }}>{surtitre}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {chiffre && <div style={{ display: "flex", fontSize: 168, fontWeight: 700, lineHeight: 1, color: accent }}>{chiffre}</div>}
          <div style={{ display: "flex", fontSize: chiffre ? 46 : 64, lineHeight: 1.2, marginTop: 18, maxWidth: 1000 }}>{legende}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 700 }}>
          <span>Data</span><span style={{ background: "#FFD23F", color: "#071A41", padding: "0 6px", marginLeft: 2 }}>Parl&apos;</span>
          <span style={{ marginLeft: 22, fontSize: 28, fontWeight: 400, color: "#C9D2EA" }}>dataparl.fr</span>
        </div>
      </div>
    ),
    TAILLE_OG,
  );
}
