/** Sticky note palette token (e.g. `amber-200`). */
export type StickyNoteColorToken =
  | "mono-200"
  | "azure-200"
  | "lime-200"
  | "amber-200"
  | "rose-200"
  | "indigo-200";

/** Full Tailwind class strings (required for Tailwind to emit utilities). */
export const STICKY_NOTE_BG_CLASS: Record<StickyNoteColorToken, string> = {
  "mono-200": "bg-wn-mono-200",
  "azure-200": "bg-wn-azure-200",
  "lime-200": "bg-wn-lime-200",
  "amber-200": "bg-wn-amber-200",
  "rose-200": "bg-wn-rose-200",
  "indigo-200": "bg-wn-indigo-200",
};

/** Dark readable text on each paper tone. */
export const STICKY_NOTE_TEXT_CLASS: Record<StickyNoteColorToken, string> = {
  "mono-200": "text-wn-mono-950",
  "azure-200": "text-wn-azure-950",
  "lime-200": "text-wn-lime-950",
  "amber-200": "text-wn-amber-950",
  "rose-200": "text-wn-rose-950",
  "indigo-200": "text-wn-indigo-950",
};

/** CSS variables for inline styles (Quill overrides). */
export const STICKY_NOTE_FG_VAR: Record<StickyNoteColorToken, string> = {
  "mono-200": "var(--color-wn-mono-950)",
  "azure-200": "var(--color-wn-azure-950)",
  "lime-200": "var(--color-wn-lime-950)",
  "amber-200": "var(--color-wn-amber-950)",
  "rose-200": "var(--color-wn-rose-950)",
  "indigo-200": "var(--color-wn-indigo-950)",
};

export const STICKY_NOTE_BG_VAR: Record<StickyNoteColorToken, string> = {
  "mono-200": "var(--color-wn-mono-200)",
  "azure-200": "var(--color-wn-azure-200)",
  "lime-200": "var(--color-wn-lime-200)",
  "amber-200": "var(--color-wn-amber-200)",
  "rose-200": "var(--color-wn-rose-200)",
  "indigo-200": "var(--color-wn-indigo-200)",
};

export function stickyNoteBgClass(color: StickyNoteColorToken): string {
  return STICKY_NOTE_BG_CLASS[color];
}

export function stickyNoteTextClass(color: StickyNoteColorToken): string {
  return STICKY_NOTE_TEXT_CLASS[color];
}

export function stickyNoteSurfaceClass(color: StickyNoteColorToken): string {
  return `${STICKY_NOTE_BG_CLASS[color]} ${STICKY_NOTE_TEXT_CLASS[color]}`;
}
