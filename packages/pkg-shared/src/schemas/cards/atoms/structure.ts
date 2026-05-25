import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const StructureConditionSchema = z.enum([
  "intact",
  "damaged",
  "ruined",
  "under_construction",
]);

export const StructureCardSchema = BaseCardSchema.extend({
  card_type: z.literal("structure"),
  condition: StructureConditionSchema.default("intact"),
});

export type StructureCard = z.infer<typeof StructureCardSchema>;
