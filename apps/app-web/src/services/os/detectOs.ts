/** Supported desktop platforms for WorldNote installers. */
export type DetectedOs = "windows" | "macos" | "linux" | "unknown";

/** Human-readable CTA labels keyed by detected OS. */
export const OS_LABELS: Record<DetectedOs, string> = {
  windows: "Download for Windows",
  macos: "Download for macOS",
  linux: "Download for Linux",
  unknown: "Download WorldNote",
};

/** Short platform names for download matrix cards. */
export const OS_NAMES: Record<Exclude<DetectedOs, "unknown">, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};

/** Installer file-type hints shown in the download matrix. */
export const OS_FILE_HINTS: Record<Exclude<DetectedOs, "unknown">, string> = {
  windows: ".exe / .msi",
  macos: ".dmg",
  linux: ".AppImage / .deb",
};

/**
 * Infer the visitor's desktop OS from a user-agent string.
 * SSR-safe — pass `navigator.userAgent` only inside client effects.
 */
export function detectOs(userAgent: string): DetectedOs {
  const ua = userAgent.toLowerCase();

  if (ua.includes("win")) {
    return "windows";
  }
  if (ua.includes("mac")) {
    return "macos";
  }
  if (ua.includes("linux")) {
    return "linux";
  }

  return "unknown";
}
