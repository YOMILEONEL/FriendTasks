import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Same PT monogram as components/layout/logo.tsx, rendered for the favicon.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f46e5",
          borderRadius: 16,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 15,
            left: 29,
            display: "flex",
            fontSize: 34,
            fontWeight: 700,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "sans-serif",
          }}
        >
          T
        </div>
        <div
          style={{
            position: "absolute",
            top: 13,
            left: 15,
            display: "flex",
            fontSize: 34,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "sans-serif",
          }}
        >
          P
        </div>
      </div>
    ),
    { ...size }
  );
}
