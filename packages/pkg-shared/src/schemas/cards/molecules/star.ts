import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const StarCardSchema = BaseCardSchema.extend({
  card_type: z.literal("star"),
  spectral_class: z.string().optional(),
});

export type StarCard = z.infer<typeof StarCardSchema>;
