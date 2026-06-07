import { invoke } from "@tauri-apps/api/core";
import { WorldCardSchema, type WorldCard } from "@worldnote/shared";
import { createLink } from "../links/createLink.js";
import { createWorldCard } from "../crudWorldCard/createWorldCard.js";
import { updateWorldCard } from "../crudWorldCard/updateWorldCard.js";
import { descriptionSummaryFromMarkdown } from "../canvas/stickyNoteMarkdown.js";
import { listWorlds } from "../worlds/listWorlds.js";
import type {
  BuildStarterPackOptions,
  StarterPack,
  StarterPackBuildResult,
} from "./types.js";

function enrichCard(
  created: WorldCard,
  def: StarterPack["cards"][number],
): WorldCard {
  const lore = def.lore?.trim() || undefined;
  const customProperties = {
    ...created.custom_properties,
    ...def.customProperties,
  };

  const enriched = {
    ...created,
    subtitle: def.subtitle?.trim() || undefined,
    lore,
    description: lore ? descriptionSummaryFromMarkdown(lore) : undefined,
    tags: def.tags ?? created.tags,
    custom_properties: customProperties,
    ...def.fields,
  };

  return WorldCardSchema.parse(enriched);
}

function resolvePackWorldName(
  packName: string,
  existingNames: Set<string>,
  forceNew: boolean,
): string {
  if (!forceNew && existingNames.has(packName)) {
    return packName;
  }
  if (!existingNames.has(packName)) {
    return packName;
  }

  let index = 2;
  let candidate = `${packName} ${index}`;
  while (existingNames.has(candidate)) {
    index += 1;
    candidate = `${packName} ${index}`;
  }
  return candidate;
}

/** Opens an existing pack world or creates one with starter cards and links. */
export async function buildStarterPackWorld(
  root: string,
  pack: StarterPack,
  options?: BuildStarterPackOptions,
): Promise<StarterPackBuildResult> {
  const worlds = await listWorlds(root);
  const existingNames = new Set(worlds.map((world) => world.name));
  const forceNew = options?.forceNew === true;
  const existing = worlds.find((world) => world.name === pack.name);

  if (existing && !forceNew) {
    return { path: existing.path, name: existing.name, created: false };
  }

  const worldName = resolvePackWorldName(pack.name, existingNames, forceNew);

  const worldPath = await invoke<string>("create_world", {
    root,
    name: worldName,
    description: pack.description,
  });

  const cardByKey = new Map<string, WorldCard>();

  for (const def of pack.cards) {
    const created = await createWorldCard({
      vault: worldPath,
      cardType: def.cardType,
      position: def.position,
      name: def.name,
    });
    const saved = await updateWorldCard(worldPath, enrichCard(created, def), {
      notify: false,
    });
    cardByKey.set(def.key, saved);
  }

  for (const link of pack.links) {
    const sourceCard = cardByKey.get(link.source);
    const targetCard = cardByKey.get(link.target);
    if (!sourceCard || !targetCard) {
      throw new Error(
        `Starter pack "${pack.id}" link references unknown card key: ${!sourceCard ? link.source : link.target}`,
      );
    }

    await createLink({
      vault: worldPath,
      sourceCard,
      sourceSocket: link.sourceSocket,
      targetCard,
      mirrorKinship: link.mirrorKinship ?? true,
      notify: false,
    });
  }

  return { path: worldPath, name: worldName, created: true };
}
