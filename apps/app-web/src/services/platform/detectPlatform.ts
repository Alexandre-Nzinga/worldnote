import type { PlatformKey } from "@/services/githubReleases/githubReleases";

export type DetectedPlatform = PlatformKey | "unknown";

export const platformLabel: Record<PlatformKey, string> = {
  windows: "Windows",
  mac: "Mac",
  linux: "Linux",
};

export function detectPlatform(): DetectedPlatform {
  if (typeof navigator === "undefined") {
    return "unknown";
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("win")) {
    return "windows";
  }

  if (userAgent.includes("mac")) {
    return "mac";
  }

  if (userAgent.includes("linux")) {
    return "linux";
  }

  return "unknown";
}

export function getOtherPlatforms(
  detected: DetectedPlatform,
): PlatformKey[] {
  const all: PlatformKey[] = ["windows", "mac", "linux"];

  if (detected === "unknown") {
    return all;
  }

  return all.filter((platform) => platform !== detected);
}
