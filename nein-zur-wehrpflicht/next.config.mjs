import { fileURLToPath } from "node:url";

// `STATIC_EXPORT=1` baut die Seite als fertige Dateien für einen normalen Webspace (siehe hostinger/LIESMICH.md).
// Die Abstimmung läuft dort über PHP, deshalb fallen die API-Routen (`route.server.ts`) in diesem Modus weg.
const STATIC = process.env.STATIC_EXPORT === "1";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Eigene App im Unterordner, nicht die Vorlage im Repo darüber
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  // `*.server.ts` gibt es nur mit Node-Server (API), `*.export.ts` nur im Datei-Paket.
  pageExtensions: STATIC ? ["export.ts", "tsx", "ts"] : ["server.ts", "tsx", "ts"],
  env: { SITE_TRAILING_SLASH: STATIC ? "1" : "0" },
  experimental: { optimizePackageImports: ["@phosphor-icons/react"] },
  ...(STATIC
    ? {
        output: "export",
        trailingSlash: true,
        // Ohne Bild-Server: Die Größen rechnet scripts/hostinger-paket.mjs beim Bauen als WebP vor.
        images: { loader: "custom", loaderFile: "./src/lib/image-loader.ts", qualities: [82] },
      }
    : {
        images: { qualities: [75, 82, 90] },
        // Schriften und Logo für die Teilen-Bilder, falls eine Route doch zur Laufzeit rendert.
        outputFileTracingIncludes: {
          "/og/[file]": ["./src/og/fonts/**/*", "./src/img/logo.svg"],
          "/story/[file]": ["./src/og/fonts/**/*", "./src/img/logo.svg"],
        },
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders }];
        },
      }),
};

export default nextConfig;
