import { convertFileSrc } from "@tauri-apps/api/core";

export function hashWorldName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export const worldCoverPalette200 = [
  "mono",
  "indigo",
  "azure",
  "rose",
  "amber",
  "lime",
] as const;

export type WorldCoverPaletteKey = (typeof worldCoverPalette200)[number];

export function worldCoverPaletteKey(name: string): WorldCoverPaletteKey {
  return worldCoverPalette200[
    hashWorldName(name) % worldCoverPalette200.length
  ];
}

export function worldCoverImageSrc(
  worldPath: string,
  coverImage?: string,
): string | undefined {
  if (!coverImage?.trim()) {
    return undefined;
  }
  const normalized = coverImage.replace(/\\/g, "/");
  const fullPath = `${worldPath.replace(/\\/g, "/")}/${normalized}`;
  return convertFileSrc(fullPath);
}

export function worldCoverStyle(name: string): { background: string } {
  const palette = worldCoverPaletteKey(name);
  return { background: `var(--color-wn-${palette}-200)` };
}

export function formatRelativeTime(unixSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - unixSeconds);

  if (diff < 60) {
    return "just now";
  }
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (diff < 2592000) {
    const days = Math.floor(diff / 86400);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  const months = Math.floor(diff / 2592000);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export function getTimeOfDayGreeting(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "morning";
  }
  if (hour < 18) {
    return "afternoon";
  }
  return "evening";
}
