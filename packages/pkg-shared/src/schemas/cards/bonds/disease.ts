import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const DiseaseCardSchema = BaseCardSchema.extend({
  card_type: z.literal("disease"),
});

export type DiseaseCard = z.infer<typeof DiseaseCardSchema>;
