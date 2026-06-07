import { invoke } from "@tauri-apps/api/core";
import { WorldCardSchema, type WorldCard } from "@worldnote/shared";
import { createLink } from "../links/createLink.js";
import { createWorldCard } from "../crudWorldCard/createWorldCard.js";
import { updateWorldCard } from "../crudWorldCard/updateWorldCard.js";
import { descriptionSummaryFromMarkdown } from "../canvas/stickyNoteMarkdown.js";
import { listWorlds } from "../worlds/listWorlds.js";
import type { StarterPack, StarterPackBuildResult } from "./types.js";

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

/** Opens an existing pack world or creates one with starter cards and links. */
export async function buildStarterPackWorld(
  root: string,
  pack: StarterPack,
): Promise<StarterPackBuildResult> {
  const worlds = await listWorlds(root);
  const existing = worlds.find((world) => world.name === pack.name);
  if (existing) {
    return { path: existing.path, name: existing.name, created: false };
  }

  const worldPath = await invoke<string>("create_world", {
    root,
    name: pack.name,
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

  return { path: worldPath, name: pack.name, created: true };
}
