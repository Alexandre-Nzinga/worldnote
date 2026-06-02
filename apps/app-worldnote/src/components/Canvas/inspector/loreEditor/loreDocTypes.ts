/** A single Quill Delta operation. */
export type DeltaOp = {
  insert?: string | Record<string, unknown>;
  delete?: number;
  retain?: number;
  attributes?: Record<string, unknown>;
};

/** Lore document is stored as a Quill Delta (`{ ops: [...] }`). */
export type LoreDoc = {
  ops: DeltaOp[];
};

export const EMPTY_LORE_DOC: LoreDoc = {
  ops: [{ insert: "\n" }],
};

/** True when a value looks like a Quill Delta. */
export function isDeltaDoc(value: unknown): value is LoreDoc {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { ops?: unknown }).ops)
  );
}

/** A Delta is empty when it has no embeds and only whitespace text. */
export function isLoreDocEmpty(doc: LoreDoc | undefined | null): boolean {
  if (!doc || !Array.isArray(doc.ops) || doc.ops.length === 0) {
    return true;
  }
  for (const op of doc.ops) {
    const insert = op.insert;
    if (typeof insert === "string") {
      if (insert.trim().length > 0) {
        return false;
      }
      continue;
    }
    // Any embed (image, card-mention, gallery) counts as content.
    if (insert && typeof insert === "object") {
      return false;
    }
  }
  return true;
}
