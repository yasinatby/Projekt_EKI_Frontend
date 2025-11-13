import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    /**
     * Begrenze Turbopack explizit auf das Projektverzeichnis, damit es nicht versucht,
     * außerhalb (z. B. /Users/…) zu scannen, was im aktuellen Setup verboten ist.
     */
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
