// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove pdfjs-dist from here if you switch to pdf-parse
  serverExternalPackages: [],
};

export default nextConfig;