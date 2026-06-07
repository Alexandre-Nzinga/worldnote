import { z } from "zod";
import type { DetectedOs } from "@/services/os/detectOs";

/** GitHub repository slug for WorldNote releases. */
export const GITHUB_REPO = "Alexandre-Nzinga/worldnote";

/** Fallback when the API is unavailable or no asset matches. */
export const RELEASES_PAGE_URL = `https://github.com/${GITHUB_REPO}/releases`;

/** GitHub REST endpoint for the latest published release. */
export const LATEST_RELEASE_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;

export const DOCS_WIKI_URL = `https://github.com/${GITHUB_REPO}/wiki`;

const GithubAssetSchema = z.object({
  name: z.string(),
  browser_download_url: z.string().url(),
});

/** Minimal release shape needed for download buttons. */
export const GithubReleaseSchema = z.object({
  tag_name: z.string(),
  html_url: z.string().url(),
  assets: z.array(GithubAssetSchema),
});

export type GithubRelease = z.infer<typeof GithubReleaseSchema>;

export type DownloadOs = Exclude<DetectedOs, "unknown">;

export type OsAssetMap = Record<DownloadOs, string | null>;

function matchesExtension(name: string, extensions: string[]): boolean {
  const lower = name.toLowerCase();
  return extensions.some((ext) => lower.endsWith(ext));
}

/**
 * Map GitHub release assets to per-OS download URLs by file extension.
 * Prefers the first matching asset per platform (Tauri CI publishes one per OS).
 */
export function mapAssetsByOs(release: GithubRelease): OsAssetMap {
  const map: OsAssetMap = {
    windows: null,
    macos: null,
    linux: null,
  };

  for (const asset of release.assets) {
    const { name, browser_download_url: url } = asset;

    if (!map.windows && matchesExtension(name, [".exe", ".msi"])) {
      map.windows = url;
    }
    if (!map.macos && matchesExtension(name, [".dmg"])) {
      map.macos = url;
    }
    if (
      !map.linux &&
      matchesExtension(name, [".appimage", ".deb", ".tar.gz"])
    ) {
      map.linux = url;
    }
  }

  return map;
}

/**
 * Fetch and validate the latest GitHub release.
 * Returns null on network errors, 404, or schema mismatch (e.g. private repo).
 */
export async function fetchLatestRelease(): Promise<GithubRelease | null> {
  try {
    const response = await fetch(LATEST_RELEASE_API_URL, {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const json: unknown = await response.json();
    const parsed = GithubReleaseSchema.safeParse(json);

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Resolve the best download URL for a platform, falling back to the releases page. */
export function getDownloadUrl(
  assetsByOs: OsAssetMap,
  os: DownloadOs,
): string {
  return assetsByOs[os] ?? RELEASES_PAGE_URL;
}
