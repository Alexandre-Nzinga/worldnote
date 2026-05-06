import { z } from "zod";

/** Bond / link entity between two cards */
export const BondSchema = z.object({
  id: z.string().uuid(),
  source: z.string().uuid(),
  target: z.string().uuid(),
  label: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type Bond = z.infer<typeof BondSchema>;
