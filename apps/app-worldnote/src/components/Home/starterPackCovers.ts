const STARTER_PACK_COVER_BASE = "/starter-packs";

/** Cover art filename inside `public/starter-packs/`. */
export function starterPackCoverSrc(coverFile?: string): string | undefined {
  if (!coverFile?.trim()) {
    return undefined;
  }
  return `${STARTER_PACK_COVER_BASE}/${coverFile}`;
}
