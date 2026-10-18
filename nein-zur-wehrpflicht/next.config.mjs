import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Eigene App im Unterordner, nicht die Vorlage im Repo darüber
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
};

export default nextConfig;
