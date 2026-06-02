import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const LanguageCardSchema = BaseCardSchema.extend({
  card_type: z.literal("language"),
});

export type LanguageCard = z.infer<typeof LanguageCardSchema>;
