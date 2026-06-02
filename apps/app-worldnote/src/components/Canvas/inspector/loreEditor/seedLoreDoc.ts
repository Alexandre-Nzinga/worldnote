import type { LoreDoc } from "./loreDocTypes.js";
import { EMPTY_LORE_DOC, isDeltaDoc } from "./loreDocTypes.js";
import {
  migrateMarkdownToDelta,
  migrateProseMirrorToDelta,
} from "./migrateLoreDoc.js";

/** Minimal legacy markdown → Quill Delta (paragraphs + ATX headings). */
export function seedLoreDocFromMarkdown(markdown: string): LoreDoc {
  return migrateMarkdownToDelta(markdown);
}

/**
 * Resolves the initial editor document, migrating legacy formats:
 * - Quill Delta → used as-is.
 * - ProseMirror/TipTap JSON (`{ type: "doc" }`) → converted to a Delta.
 * - Legacy markdown lore/description strings → converted to a Delta.
 */
export function resolveInitialLoreDoc(
  loreDoc: Record<string, unknown> | undefined,
  legacyLore: string | undefined,
  legacyDescription?: string,
): LoreDoc {
  if (isDeltaDoc(loreDoc)) {
    return loreDoc;
  }
  if (loreDoc && typeof loreDoc === "object" && loreDoc.type === "doc") {
    return migrateProseMirrorToDelta(loreDoc as never);
  }
  if (legacyLore?.trim()) {
    return migrateMarkdownToDelta(legacyLore);
  }
  if (legacyDescription?.trim()) {
    return migrateMarkdownToDelta(legacyDescription);
  }
  return { ...EMPTY_LORE_DOC };
}

/** Plain-text summary for card previews (first non-empty line). */
export function descriptionSummaryFromPlainText(
  plainText: string,
): string | undefined {
  const line = plainText
    .split("\n")
    .map((part) => part.trim())
    .find((part) => part.length > 0);
  return line || undefined;
}
