import { FANTASY_KINGDOM_PACK } from "./packs/fantasyKingdom.js";
import type { StarterPack } from "./types.js";

export const STARTER_PACKS: StarterPack[] = [FANTASY_KINGDOM_PACK];

export function getStarterPack(id: string): StarterPack | undefined {
  return STARTER_PACKS.find((pack) => pack.id === id);
}
