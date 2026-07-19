import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin (and its jwks-rsa -> jose ESM dependency) must not be
  // bundled by Turbopack for serverless functions, or it throws
  // ERR_REQUIRE_ESM at runtime. Load it as an external Node module instead.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
