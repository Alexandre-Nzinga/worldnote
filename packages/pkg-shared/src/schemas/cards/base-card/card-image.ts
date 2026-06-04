import { z } from "zod";

export const CardImageFitSchema = z.enum(["fit", "fill", "crop"]);

export type CardImageFit = z.infer<typeof CardImageFitSchema>;

export const CardImageRotationSchema = z.union([
  z.literal(0),
  z.literal(90),
  z.literal(180),
  z.literal(270),
]);

export type CardImageRotation = z.infer<typeof CardImageRotationSchema>;

export const CardImagePositionSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  /** Display scale for cover images (100 = default). */
  zoom: z.number().min(50).max(300).optional(),
  rotation: CardImageRotationSchema.optional(),
  flipX: z.boolean().optional(),
  flipY: z.boolean().optional(),
});

export type CardImagePosition = z.infer<typeof CardImagePositionSchema>;

export const DEFAULT_CARD_IMAGE_FIT: CardImageFit = "fill";
export const DEFAULT_CARD_IMAGE_ZOOM = 100;
export const MIN_CARD_IMAGE_ZOOM = 50;
export const MAX_CARD_IMAGE_ZOOM = 300;
export const DEFAULT_CARD_IMAGE_POSITION: CardImagePosition = {
  x: 50,
  y: 50,
  zoom: DEFAULT_CARD_IMAGE_ZOOM,
};
