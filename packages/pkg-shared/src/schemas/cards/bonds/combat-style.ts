import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const CombatStyleCardSchema = BaseCardSchema.extend({
  card_type: z.literal("combat_style"),
});

export type CombatStyleCard = z.infer<typeof CombatStyleCardSchema>;
