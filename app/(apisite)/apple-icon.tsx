import { ImageResponse } from "next/og";

// Icône tactile iOS (180x180) de l'espace API : monogramme « À » —
// même famille que le D' du site principal (palette : #FFD23F / #164DFF).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFD23F",
          borderRadius: 40,
          fontSize: 108,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
          color: "#164DFF",
        }}
      >
        À
      </div>
    ),
    { ...size }
  );
}
