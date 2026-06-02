import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const ReligionCardSchema = BaseCardSchema.extend({
  card_type: z.literal("religion"),
});

export type ReligionCard = z.infer<typeof ReligionCardSchema>;
