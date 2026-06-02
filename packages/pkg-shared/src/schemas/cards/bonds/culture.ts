import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const CultureCardSchema = BaseCardSchema.extend({
  card_type: z.literal("culture"),
});

export type CultureCard = z.infer<typeof CultureCardSchema>;
