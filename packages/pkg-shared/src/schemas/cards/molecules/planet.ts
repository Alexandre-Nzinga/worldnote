import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const PlanetCardSchema = BaseCardSchema.extend({
  card_type: z.literal("planet"),
  planet_type: z.string().optional(),
});

export type PlanetCard = z.infer<typeof PlanetCardSchema>;
