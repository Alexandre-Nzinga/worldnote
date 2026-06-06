import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";
import { ChronologyFieldsSchema } from "../../timeline/chronology-fields.js";

export const EventCardSchema = BaseCardSchema.extend({
  card_type: z.literal("event"),
  ...ChronologyFieldsSchema.shape,
});

export type EventCard = z.infer<typeof EventCardSchema>;
