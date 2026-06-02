import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const OrganizationCardSchema = BaseCardSchema.extend({
  card_type: z.literal("organization"),
  founding_date: z.string().optional(),
});

export type OrganizationCard = z.infer<typeof OrganizationCardSchema>;
