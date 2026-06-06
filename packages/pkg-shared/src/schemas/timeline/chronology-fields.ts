import { z } from "zod";

/** Shared chronological metadata for timeline-eligible cards. */
export const ChronologyFieldsSchema = z.object({
  /** Birth year, event start, or single-point date (integer axis). */
  start_year: z.number().int().optional(),
  /** Death year or event end (integer axis). */
  end_year: z.number().int().optional(),
  /** Optional reference to a world era background zone. */
  era_id: z.string().uuid().optional(),
  /** Optional reference to a world period background zone. */
  period_id: z.string().uuid().optional(),
});

export type ChronologyFields = z.infer<typeof ChronologyFieldsSchema>;
