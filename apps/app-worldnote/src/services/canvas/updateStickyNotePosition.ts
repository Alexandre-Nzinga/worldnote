import type { StickyNotePlacement } from "@worldnote/canvas";
import { StickyNotePlacementSchema, StickyNoteSchema } from "@worldnote/shared";
import type { StickyNote } from "@worldnote/shared";
import { updateCanvasManifestStickyNote } from "./canvasManifest.js";
import {
  serializeStickyNoteMarkdown,
  writeStickyNoteMarkdown,
} from "./stickyNoteMarkdown.js";

function createDebouncedManifestUpdater(vault: string, debounceMs: number) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  return (placement: StickyNotePlacement) => {
    const existing = timers.get(placement.id);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(async () => {
      timers.delete(placement.id);
      const parsed = StickyNotePlacementSchema.parse(placement);
      await updateCanvasManifestStickyNote(vault, parsed);
    }, debounceMs);
    timers.set(placement.id, timer);
  };
}

function createDebouncedMarkdownUpdater(vault: string, debounceMs: number) {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  return (note: StickyNote) => {
    const existing = timers.get(note.id);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(async () => {
      timers.delete(note.id);
      const parsed = StickyNoteSchema.parse(note);
      const markdown = serializeStickyNoteMarkdown(
        parsed.heading,
        parsed.content,
      );
      await writeStickyNoteMarkdown(vault, parsed.id, markdown);
    }, debounceMs);
    timers.set(note.id, timer);
  };
}

export function createStickyNotePositionUpdater(
  vault: string,
  debounceMs = 300,
) {
  return createDebouncedManifestUpdater(vault, debounceMs);
}

/** Updates layout-only fields in canvas_manifest.json. */
export function createStickyNoteManifestUpdater(
  vault: string,
  debounceMs = 300,
) {
  return createDebouncedManifestUpdater(vault, debounceMs);
}

/** Validates StickyNoteSchema and writes body to sticky-notes/{id}.md. */
export function createStickyNoteMarkdownUpdater(
  vault: string,
  debounceMs = 400,
) {
  return createDebouncedMarkdownUpdater(vault, debounceMs);
}

/** @deprecated Use createStickyNoteManifestUpdater or createStickyNoteMarkdownUpdater. */
export function createStickyNoteContentUpdater(
  vault: string,
  debounceMs = 400,
) {
  return createDebouncedManifestUpdater(vault, debounceMs);
}
