import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const GroupCardSchema = BaseCardSchema.extend({
  card_type: z.literal("group"),
  group_type: z.string().optional(),
});

export type GroupCard = z.infer<typeof GroupCardSchema>;
