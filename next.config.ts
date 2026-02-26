import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  outputFileTracingIncludes: {
    "/api/documents/\\[shipmentId\\]": ["./templates/**/*"],
    "/api/documents/\\[shipmentId\\]/all": ["./templates/**/*"],
    "/api/email/\\[shipmentId\\]": ["./templates/**/*"],
  },
};

export default nextConfig;
