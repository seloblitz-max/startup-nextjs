import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Eigene App im Unterordner, nicht die Vorlage im Repo darüber
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  images: { qualities: [75, 82, 90] },
  experimental: { optimizePackageImports: ["@phosphor-icons/react"] },
  // Schriften und Fotos für die Teilen-Bilder werden zur Laufzeit gelesen.
  outputFileTracingIncludes: {
    "/story/[city]": ["./src/og/**/*"],
    "/opengraph-image": ["./src/og/**/*"],
    "/dabei/[city]/opengraph-image": ["./src/og/**/*"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
