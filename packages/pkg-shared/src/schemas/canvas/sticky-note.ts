import { z } from "zod";

export const STICKY_NOTE_COLORS = [
  "mono-200",
  "azure-200",
  "lime-200",
  "amber-200",
  "rose-200",
  "indigo-200",
] as const;

export type StickyNoteColor = (typeof STICKY_NOTE_COLORS)[number];

export function isStickyNoteColor(value: string): value is StickyNoteColor {
  return STICKY_NOTE_COLORS.some((color) => color === value);
}

export const DEFAULT_STICKY_NOTE_COLOR: StickyNoteColor = "amber-200";

export const StickyNoteColorSchema = z.enum(STICKY_NOTE_COLORS);

/** In-memory sticky note state validated before writing `.md` files. */
export const StickyNoteSchema = z.object({
  id: z.string().uuid(),
  heading: z.string().optional(),
  content: z.string(),
  color: StickyNoteColorSchema,
  position: z.object({ x: z.number(), y: z.number() }),
  width: z.number().default(200),
  height: z.number().default(200),
});

export type StickyNote = z.infer<typeof StickyNoteSchema>;

/** Layout-only entry in canvas_manifest.json `stickyNotes[]`. */
export const StickyNotePlacementSchema = z.object({
  id: z.string().uuid(),
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
  heading: z.string().max(200).optional(),
  color: StickyNoteColorSchema.optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

export type StickyNotePlacement = z.infer<typeof StickyNotePlacementSchema>;
