import { invoke } from "@tauri-apps/api/core";
import { WorldCardSchema, type WorldCard } from "@worldnote/shared";
import { createLink } from "../links/createLink.js";
import {
  removeCanvasManifestNode,
  updateCanvasManifestImage,
  updateCanvasManifestStickyNote,
} from "../canvas/canvasManifest.js";
import { createWorldCard } from "../crudWorldCard/createWorldCard.js";
import { updateWorldCard } from "../crudWorldCard/updateWorldCard.js";
import {
  descriptionSummaryFromMarkdown,
  serializeStickyNoteMarkdown,
  writeStickyNoteMarkdown,
} from "../canvas/stickyNoteMarkdown.js";
import { saveCanvasImageBytes } from "../desktop/saveCanvasImage.js";
import { deleteWorld } from "../worlds/deleteWorld.js";
import { listWorlds } from "../worlds/listWorlds.js";
import type {
  BuildStarterPackOptions,
  StarterPack,
  StarterPackBuildResult,
} from "./types.js";

function readTutorialAnchor(
  customProperties: Record<string, string | number | boolean> | undefined,
): string | undefined {
  const value = customProperties?.tutorial_anchor;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

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

function buildCardAnchorMap(
  cards: Iterable<WorldCard>,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const card of cards) {
    const anchor = readTutorialAnchor(card.custom_properties);
    if (anchor) {
      map[anchor] = card.id;
    }
  }
  return map;
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
    try {
      await invoke<string>("open_world", { root: existing.path });
      return {
        path: existing.path,
        name: existing.name,
        created: false,
        cardAnchorMap: {},
        stickyNoteAnchorMap: {},
        canvasImageAnchorMap: {},
      };
    } catch (error) {
      console.warn(
        `Starter pack "${pack.id}" world was invalid, recreating:`,
        error,
      );
      await deleteWorld(existing.path);
    }
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

  for (const def of pack.cards) {
    if (!def.groupKey) {
      continue;
    }
    const member = cardByKey.get(def.key);
    const group = cardByKey.get(def.groupKey);
    if (!member || !group) {
      throw new Error(
        `Starter pack "${pack.id}" group member references unknown key: ${def.groupKey}`,
      );
    }
    const nested = WorldCardSchema.parse({
      ...member,
      parent_id: group.id,
    });
    await updateWorldCard(worldPath, nested, { notify: false });
    await removeCanvasManifestNode(worldPath, member.id);
    cardByKey.set(def.key, nested);
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

  const stickyNoteAnchorMap: Record<string, string> = {};
  for (const note of pack.stickyNotes ?? []) {
    const noteId = crypto.randomUUID();
    await writeStickyNoteMarkdown(
      worldPath,
      noteId,
      serializeStickyNoteMarkdown(note.heading, note.content),
    );
    await updateCanvasManifestStickyNote(worldPath, {
      id: noteId,
      x: note.x,
      y: note.y,
      heading: note.heading,
      color: note.color,
      width: note.width ?? 220,
      height: note.height ?? 180,
    });
    if (note.tutorialAnchor) {
      stickyNoteAnchorMap[note.tutorialAnchor] = noteId;
    }
  }

  const canvasImageAnchorMap: Record<string, string> = {};
  for (const image of pack.canvasImages ?? []) {
    const imageId = crypto.randomUUID();
    const response = await fetch(image.publicAssetPath);
    if (!response.ok) {
      throw new Error(
        `Starter pack "${pack.id}" could not load image asset: ${image.publicAssetPath}`,
      );
    }
    const bytes = await response.arrayBuffer();
    const fileName = image.publicAssetPath.split("/").pop() ?? "image.png";
    const imagePath = await saveCanvasImageBytes(
      worldPath,
      imageId,
      fileName,
      bytes,
    );
    await updateCanvasManifestImage(worldPath, {
      id: imageId,
      x: image.x,
      y: image.y,
      imagePath,
      width: image.width ?? 240,
      height: image.height ?? 160,
    });
    canvasImageAnchorMap[image.key] = imageId;
  }

  const allCards = [...cardByKey.values()];

  return {
    path: worldPath,
    name: worldName,
    created: true,
    cardAnchorMap: buildCardAnchorMap(allCards),
    stickyNoteAnchorMap,
    canvasImageAnchorMap,
  };
}
