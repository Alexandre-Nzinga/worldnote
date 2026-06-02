import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const LawCardSchema = BaseCardSchema.extend({
  card_type: z.literal("law"),
});

export type LawCard = z.infer<typeof LawCardSchema>;
