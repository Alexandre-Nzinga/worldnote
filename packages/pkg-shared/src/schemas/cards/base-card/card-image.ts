import { z } from "zod";

export const CardImageFitSchema = z.enum(["fit", "fill", "crop"]);

export type CardImageFit = z.infer<typeof CardImageFitSchema>;

export const CardImagePositionSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

export type CardImagePosition = z.infer<typeof CardImagePositionSchema>;

export const DEFAULT_CARD_IMAGE_FIT: CardImageFit = "fill";
export const DEFAULT_CARD_IMAGE_POSITION: CardImagePosition = { x: 50, y: 50 };
