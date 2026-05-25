import { z } from "zod";

/** Typed wire between a source card socket and a target card. */
export const LinkSchema = z.object({
  id: z.string().uuid(),
  source_card: z.string().uuid(),
  source_socket: z.string().min(1),
  target_card: z.string().uuid(),
});

export type Link = z.infer<typeof LinkSchema>;
