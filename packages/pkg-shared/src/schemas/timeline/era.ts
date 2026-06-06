import { z } from "zod";

export const EraSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  start_year: z.number().int(),
  end_year: z.number().int(),
  /** Optional CSS color for the background zone. */
  color: z.string().optional(),
});

export type Era = z.infer<typeof EraSchema>;
