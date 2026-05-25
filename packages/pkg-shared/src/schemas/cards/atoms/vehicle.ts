import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const VehicleSubTypeSchema = z.enum([
  "car",
  "ship",
  "spaceship",
  "mount",
  "bike",
  "other",
]);

export const VehicleCardSchema = BaseCardSchema.extend({
  card_type: z.literal("vehicle"),
  sub_type: VehicleSubTypeSchema,
  max_speed: z.string().optional(),
});

export type VehicleCard = z.infer<typeof VehicleCardSchema>;
