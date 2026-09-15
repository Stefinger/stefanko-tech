import type { NextConfig } from "next";

/**
 * Routing overview
 *
 * `/` and `/en`        — the static homepage (public/index.html, public/en.html).
 *                        Served through rewrites so the URL never shows `.html`
 *                        and no Next layout, styles or runtime wrap the page.
 * `/old-web`, `/old-web/cs` — the original Next.js site, archived and noindex.
 * `/cs`                — the original Czech URL, permanently redirected to `/`.
 *
 * There is intentionally no catch-all: unknown paths (including the removed
 * `/intro-lab`) fall through to Next's 404.
 */
const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },

  async rewrites() {
    return [
      { source: "/", destination: "/index.html" },
      { source: "/en", destination: "/en.html" },
    ];
  },

  async redirects() {
    return [
      // The old Czech route: Czech is now the root homepage.
      { source: "/cs", destination: "/", permanent: true },
      // Canonical URLs for the static documents. Redirects are matched against
      // the incoming request only, so they do not affect the rewrites above,
      // whose destinations are resolved internally.
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/en.html", destination: "/en", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        // The archived site must stay crawlable (so the noindex is readable)
        // but must never be indexed. Mirrors the robots metadata in
        // src/lib/i18n/metadata.ts.
        source: "/old-web/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
