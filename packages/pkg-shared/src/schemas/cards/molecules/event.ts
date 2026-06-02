import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const EventCardSchema = BaseCardSchema.extend({
  card_type: z.literal("event"),
  event_date: z.string().optional(),
});

export type EventCard = z.infer<typeof EventCardSchema>;
