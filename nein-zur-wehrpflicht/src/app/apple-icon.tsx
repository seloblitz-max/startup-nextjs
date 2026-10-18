import { ImageResponse } from "next/og";
import { SQUIRREL_PATH } from "@/og/squirrel";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0b0a" }}>
        <svg width="124" height="124" viewBox="0 0 256 256">
          <path d={SQUIRREL_PATH} fill="#ff7405" fillRule="evenodd" />
        </svg>
      </div>
    ),
    size,
  );
}
