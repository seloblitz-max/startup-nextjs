import { ImageResponse } from "next/og";
import { CROWN_PATH } from "@/og/crown";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0b0a" }}>
        <svg width="116" height="116" viewBox="0 0 256 256">
          <path d={CROWN_PATH} fill="#e5251c" />
        </svg>
      </div>
    ),
    size,
  );
}
