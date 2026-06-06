export const GITHUB_REPO = "Alexandre-Nzinga/worldnote";

export const LATEST_RELEASE_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export const FALLBACK_RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases`;

export type PlatformKey = "windows" | "mac" | "linux";

export type PlatformDownloads = Partial<Record<PlatformKey, string>>;

export type DownloadAsset = {
  name: string;
  url: string;
  format: string;
};

export type PlatformAssetGroup = {
  platform: PlatformKey;
  assets: DownloadAsset[];
};

export type LatestRelease = {
  version: string;
  downloads: PlatformDownloads;
  assetGroups: PlatformAssetGroup[];
};

type GitHubReleaseAsset = {
  name: string;
  browser_download_url: string;
};

const WINDOWS_ASSET_PATTERN = /\.(msi|exe)$/i;
const MAC_ASSET_PATTERN = /\.(dmg|app\.tar\.gz)$/i;
const LINUX_ASSET_PATTERN = /\.(AppImage|deb)$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGitHubReleaseAsset(value: unknown): value is GitHubReleaseAsset {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.name === "string" &&
    typeof value.browser_download_url === "string"
  );
}

function isGitHubReleasePayload(value: unknown): value is {
  tag_name: string;
  assets: GitHubReleaseAsset[];
} {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.tag_name !== "string") {
    return false;
  }

  if (!Array.isArray(value.assets)) {
    return false;
  }

  return value.assets.every(isGitHubReleaseAsset);
}

const PLATFORM_ASSET_PATTERNS: Record<PlatformKey, RegExp> = {
  windows: WINDOWS_ASSET_PATTERN,
  mac: MAC_ASSET_PATTERN,
  linux: LINUX_ASSET_PATTERN,
};

function extractFormat(name: string): string {
  const extensionMatch = name.match(/\.([^.]+)$/i);
  if (!extensionMatch) {
    return name;
  }

  const extension = extensionMatch[1];
  if (extension.toLowerCase() === "gz" && name.endsWith(".tar.gz")) {
    return ".tar.gz";
  }

  return `.${extension}`;
}

function findAssetUrl(
  assets: GitHubReleaseAsset[],
  pattern: RegExp,
): string | undefined {
  const match = assets.find((asset) => pattern.test(asset.name));
  return match?.browser_download_url;
}

function findMatchingAssets(
  assets: GitHubReleaseAsset[],
  pattern: RegExp,
): DownloadAsset[] {
  return assets
    .filter((asset) => pattern.test(asset.name))
    .map((asset) => ({
      name: asset.name,
      url: asset.browser_download_url,
      format: extractFormat(asset.name),
    }));
}

function mapAssetsToDownloads(
  assets: GitHubReleaseAsset[],
): PlatformDownloads {
  return {
    windows: findAssetUrl(assets, WINDOWS_ASSET_PATTERN),
    mac: findAssetUrl(assets, MAC_ASSET_PATTERN),
    linux: findAssetUrl(assets, LINUX_ASSET_PATTERN),
  };
}

export function mapAssetsToGroups(
  assets: GitHubReleaseAsset[],
): PlatformAssetGroup[] {
  const platforms: PlatformKey[] = ["windows", "mac", "linux"];

  return platforms.map((platform) => ({
    platform,
    assets: findMatchingAssets(assets, PLATFORM_ASSET_PATTERNS[platform]),
  }));
}

export async function fetchLatestRelease(): Promise<LatestRelease> {
  const response = await fetch(LATEST_RELEASE_URL, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub releases request failed with status ${response.status}`,
    );
  }

  const payload: unknown = await response.json();

  if (!isGitHubReleasePayload(payload)) {
    throw new Error("GitHub releases payload has an unexpected shape");
  }

  return {
    version: payload.tag_name,
    downloads: mapAssetsToDownloads(payload.assets),
    assetGroups: mapAssetsToGroups(payload.assets),
  };
}
