import { ImageResponse } from "next/og";

// Icône tactile iOS (180x180) : meme identité que /favicon.ico et /icon.svg.
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
          background: "#164DFF",
          borderRadius: 36,
          fontSize: 104,
          fontWeight: 700,
          color: "#FFFFFF",
        }}
      >
        <span>D</span>
        <span style={{ color: "#FFD23F" }}>Parl'</span>
      </div>
    ),
    { ...size }
  );
}
