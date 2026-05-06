import { z } from "zod";

/** PRD § Base Card Schema (pages 17–18) — contract anchor. */
export const BaseCardSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  parent_id: z.string().uuid().nullable(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  tags: z.array(z.string()),
  custom_properties: z.record(z.string(), z.any()),
});

export type BaseCard = z.infer<typeof BaseCardSchema>;
