import { z } from "zod";
import { BaseCardSchema } from "../base-card/base-card.js";

export const ItemRaritySchema = z.enum([
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "artifact",
]);

export const ItemCardSchema = BaseCardSchema.extend({
  card_type: z.literal("item"),
  weight: z.number().optional(),
  rarity: ItemRaritySchema.optional(),
});

export type ItemCard = z.infer<typeof ItemCardSchema>;
