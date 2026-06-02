import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const DisasterCardSchema = BaseCardSchema.extend({
  card_type: z.literal("disaster"),
});

export type DisasterCard = z.infer<typeof DisasterCardSchema>;
