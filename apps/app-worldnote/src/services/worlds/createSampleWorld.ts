import { invoke } from "@tauri-apps/api/core";
import { createLink } from "../links/createLink.js";
import { createWorldCard } from "../crudWorldCard/createWorldCard.js";
import { listWorlds } from "./listWorlds.js";

const SAMPLE_WORLD_NAME = "Sample World";
const SAMPLE_WORLD_DESCRIPTION =
  "A starter world with connected cards to explore WorldNote.";

export type SampleWorldResult = {
  path: string;
  name: string;
  created: boolean;
};

/** Opens an existing sample world or creates one with starter cards and a link. */
export async function createSampleWorld(root: string): Promise<SampleWorldResult> {
  const worlds = await listWorlds(root);
  const existing = worlds.find((world) => world.name === SAMPLE_WORLD_NAME);
  if (existing) {
    return { path: existing.path, name: existing.name, created: false };
  }

  const worldPath = await invoke<string>("create_world", {
    root,
    name: SAMPLE_WORLD_NAME,
    description: SAMPLE_WORLD_DESCRIPTION,
  });

  const protagonist = await createWorldCard({
    vault: worldPath,
    cardType: "character",
    position: { x: -220, y: 0 },
    name: "Aria Chen",
  });
  const setting = await createWorldCard({
    vault: worldPath,
    cardType: "location",
    position: { x: 220, y: 0 },
    name: "Harbor District",
  });

  await createLink({
    vault: worldPath,
    sourceCard: protagonist,
    sourceSocket: "birthplace",
    targetCard: setting,
    mirrorKinship: false,
  });

  return { path: worldPath, name: SAMPLE_WORLD_NAME, created: true };
}
