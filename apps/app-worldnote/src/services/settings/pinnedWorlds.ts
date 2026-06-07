import type { WorldSummary } from "../worlds/listWorlds.js";

export const MAX_PINNED_WORLDS = 3;

export function getPinnedWorldPaths(
  settings: { pinnedWorldPaths?: string[] } | null,
): string[] {
  return settings?.pinnedWorldPaths ?? [];
}

/** Keep only existing paths, preserve order, cap at max. */
export function normalizePinnedWorldPaths(
  paths: string[] | undefined,
  validPaths: Set<string>,
): string[] {
  return (paths ?? [])
    .filter((path) => validPaths.has(path))
    .slice(0, MAX_PINNED_WORLDS);
}

export function togglePinnedWorldPath(
  paths: string[],
  path: string,
): { paths: string[]; error?: string } {
  const index = paths.indexOf(path);
  if (index >= 0) {
    return { paths: paths.filter((p) => p !== path) };
  }
  if (paths.length >= MAX_PINNED_WORLDS) {
    return {
      paths,
      error: `You can pin up to ${MAX_PINNED_WORLDS} worlds`,
    };
  }
  return { paths: [...paths, path] };
}

export function remapPinnedWorldPath(
  paths: string[],
  oldPath: string,
  newPath: string,
): string[] {
  return paths.map((p) => (p === oldPath ? newPath : p));
}

export function removePinnedWorldPath(paths: string[], path: string): string[] {
  return paths.filter((p) => p !== path);
}

function sortWorldsByLastEdited(worlds: WorldSummary[]): WorldSummary[] {
  return [...worlds].sort((left, right) => right.lastEdited - left.lastEdited);
}

export function partitionWorldsByPinned(
  worlds: WorldSummary[],
  pinnedPaths: string[],
): { pinned: WorldSummary[]; unpinned: WorldSummary[] } {
  const byPath = new Map(worlds.map((world) => [world.path, world]));
  const pinned = sortWorldsByLastEdited(
    pinnedPaths
      .map((path) => byPath.get(path))
      .filter((world): world is WorldSummary => world != null),
  );
  const pinnedSet = new Set(pinnedPaths);
  const unpinned = sortWorldsByLastEdited(
    worlds.filter((world) => !pinnedSet.has(world.path)),
  );
  return { pinned, unpinned };
}
