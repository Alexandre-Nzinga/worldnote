import { z } from "zod";
import { CardImageFitSchema, CardImagePositionSchema } from "./card-image.js";

/** Card Schema contract anchor. */
export const BaseCardSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  parent_id: z.string().uuid().nullable(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  tags: z.array(z.string()),
  /** Relative path within the world vault (e.g. `.worldnote/assets/{id}/cover.png`). */
  image_path: z.string().optional(),
  /** How the image is scaled inside the card frame: fit (letterbox), fill (cover), crop (cover + focal point). */
  image_fit: CardImageFitSchema.optional(),
  /** Focal point for object-position, as percentages 0–100. */
  image_position: CardImagePositionSchema.optional(),
  description: z.string().optional(),
  /** Epithet, alias, or secondary name (e.g. "Muad'Dib"). */
  subtitle: z.string().optional(),
  /** Long-form markdown body for the Lore tab (plain-text fallback / legacy). */
  lore: z.string().optional(),
  /** TipTap ProseMirror JSON document for the Lore rich editor. */
  lore_doc: z.record(z.string(), z.unknown()).optional(),
  custom_properties: z.record(z.string(), z.any()),
});

export type BaseCard = z.infer<typeof BaseCardSchema>;
