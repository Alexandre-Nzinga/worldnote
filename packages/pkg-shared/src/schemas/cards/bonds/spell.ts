import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const SpellCardSchema = BaseCardSchema.extend({
  card_type: z.literal("spell"),
});

export type SpellCard = z.infer<typeof SpellCardSchema>;
