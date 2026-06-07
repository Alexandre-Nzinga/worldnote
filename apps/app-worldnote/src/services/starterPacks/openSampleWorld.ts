import { buildStarterPackWorld } from "./buildStarterPack.js";
import { FANTASY_KINGDOM_PACK } from "./packs/fantasyKingdom.js";
import type { StarterPackBuildResult } from "./types.js";

/** Opens or creates the sample world (Kingdom of Eldreth starter pack). */
export async function openSampleWorld(
  root: string,
): Promise<StarterPackBuildResult> {
  return buildStarterPackWorld(root, FANTASY_KINGDOM_PACK);
}
