import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const noStoreHeader = [{ key: "Cache-Control", value: "private, no-store, max-age=0" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/account", headers: noStoreHeader },
      { source: "/account/:path*", headers: noStoreHeader },
      { source: "/orders/:path*", headers: noStoreHeader },
      { source: "/admin/:path*", headers: noStoreHeader },
      { source: "/checkout/:path*", headers: noStoreHeader },
      { source: "/auth/:path*", headers: noStoreHeader },
      { source: "/login", headers: noStoreHeader },
      { source: "/register", headers: noStoreHeader },
      { source: "/complete-profile", headers: noStoreHeader },
      { source: "/forgot-password", headers: noStoreHeader },
      { source: "/verify-code", headers: noStoreHeader },
      { source: "/reset-password", headers: noStoreHeader },
    ];
  },
};

export default nextConfig;
