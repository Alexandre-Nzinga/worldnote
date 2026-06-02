import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const SatelliteCardSchema = BaseCardSchema.extend({
  card_type: z.literal("satellite"),
  orbit_type: z.string().optional(),
});

export type SatelliteCard = z.infer<typeof SatelliteCardSchema>;
