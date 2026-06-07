import { z } from "zod";

export const ChronologyEntrySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  start_year: z.number().int(),
  end_year: z.number().int(),
  /** Optional CSS color for the timeline bar. */
  color: z.string().optional(),
  /** Parent chronology entry, when nested (e.g. century inside an age). */
  parent_id: z.string().uuid().nullable().optional(),
});

export type ChronologyEntry = z.infer<typeof ChronologyEntrySchema>;
