import { ImageResponse } from "next/og";
import { CROWN_PATH } from "@/og/crown";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0b0a", borderRadius: 14 }}>
        <svg width="46" height="46" viewBox="0 0 256 256">
          <path d={CROWN_PATH} fill="#e5251c" />
        </svg>
      </div>
    ),
    size,
  );
}
