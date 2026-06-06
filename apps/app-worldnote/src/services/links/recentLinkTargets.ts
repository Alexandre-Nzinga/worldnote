const STORAGE_KEY_PREFIX = "wn-recent-link-targets:";
const MAX_RECENT = 8;

function storageKey(vaultPath: string): string {
  return `${STORAGE_KEY_PREFIX}${vaultPath}`;
}

function readRecentIds(vaultPath: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(storageKey(vaultPath));
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

/** Recently used link targets for a vault (most recent first). */
export function getRecentLinkTargetIds(vaultPath: string | null): string[] {
  if (!vaultPath) {
    return [];
  }
  return readRecentIds(vaultPath);
}

/** Remember a card as a recent link target after a successful connection. */
export function recordRecentLinkTarget(
  vaultPath: string,
  cardId: string,
): void {
  if (typeof window === "undefined") {
    return;
  }
  const existing = readRecentIds(vaultPath).filter((id) => id !== cardId);
  const next = [cardId, ...existing].slice(0, MAX_RECENT);
  window.localStorage.setItem(storageKey(vaultPath), JSON.stringify(next));
}
