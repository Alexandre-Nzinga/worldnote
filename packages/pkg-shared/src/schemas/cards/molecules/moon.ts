import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const MoonCardSchema = BaseCardSchema.extend({
  card_type: z.literal("moon"),
  orbital_period: z.string().optional(),
});

export type MoonCard = z.infer<typeof MoonCardSchema>;
