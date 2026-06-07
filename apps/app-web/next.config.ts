import type { NextConfig } from "next";

/** Mintlify hosted docs — override via DOCS_UPSTREAM in Vercel if needed. */
const DOCS_UPSTREAM =
  process.env.DOCS_UPSTREAM ?? "https://worldnote.mintlify.app";

/**
 * After enabling "Host at /docs" in the Mintlify dashboard, set
 * DOCS_SUBPATH=docs so content rewrites target /docs on the upstream host.
 */
const DOCS_SUBPATH = process.env.DOCS_SUBPATH ?? "";

function upstreamDocsRoot(): string {
  return DOCS_SUBPATH
    ? `${DOCS_UPSTREAM}/${DOCS_SUBPATH}`
    : `${DOCS_UPSTREAM}/`;
}

function upstreamDocsPage(path: string): string {
  return DOCS_SUBPATH
    ? `${DOCS_UPSTREAM}/${DOCS_SUBPATH}/${path}`
    : `${DOCS_UPSTREAM}/${path}`;
}

const nextConfig: NextConfig = {
  transpilePackages: ["@worldnote/ui", "@heroui/react", "framer-motion"],
  async rewrites() {
    return [
      // Mintlify CSS/JS — always served from site root on .mintlify.app
      {
        source: "/mintlify-assets/:path*",
        destination: `${DOCS_UPSTREAM}/mintlify-assets/:path*`,
      },
      {
        source: "/_mintlify/:path*",
        destination: `${DOCS_UPSTREAM}/_mintlify/:path*`,
      },
      {
        source: "/docs",
        destination: upstreamDocsRoot(),
      },
      {
        source: "/docs/:path*",
        destination: upstreamDocsPage(":path*"),
      },
    ];
  },
};

export default nextConfig;
