import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same FT monogram as components/layout/logo.tsx and app/icon.tsx, sized
// for the iOS home-screen icon (iOS applies its own corner mask).
export default function AppleIcon() {
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
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 69,
            display: "flex",
            fontSize: 96,
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
            top: 38,
            left: 29,
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "sans-serif",
          }}
        >
          F
        </div>
      </div>
    ),
    { ...size }
  );
}
