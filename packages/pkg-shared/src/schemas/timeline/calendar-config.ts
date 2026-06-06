import { z } from "zod";

/** Per-world calendar display settings (integer axis + optional suffix). */
export const CalendarConfigSchema = z.object({
  /** Suffix appended to year labels, e.g. "AG" → "10191 AG". */
  suffix: z.string().default(""),
});

export type CalendarConfig = z.infer<typeof CalendarConfigSchema>;
