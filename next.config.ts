import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add pdfjs-dist to external packages
  serverExternalPackages: ["pdfjs-dist"],
};

export default nextConfig;