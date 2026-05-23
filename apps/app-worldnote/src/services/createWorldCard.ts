import type { CanvasNodePlacement } from "@worldnote/canvas";
import { invoke } from "@tauri-apps/api/core";
import { WorldCardSchema, type WorldCard } from "@worldnote/shared";
import { createCardTemplate, type NewCardType } from "./cardTemplates.js";
import { updateCanvasManifestNode } from "./canvasManifest.js";

type CreateWorldCardInput = {
  vault: string;
  cardType: NewCardType;
  position: { x: number; y: number };
};

export async function createWorldCard({
  vault,
  cardType,
  position,
}: CreateWorldCardInput): Promise<WorldCard> {
  const draft = createCardTemplate(cardType, position);
  const card = WorldCardSchema.parse(draft);

  await invoke<void>("upsert_card", { vault, card });
  const placement: CanvasNodePlacement = {
    cardId: card.id,
    x: card.position.x,
    y: card.position.y,
  };
  await updateCanvasManifestNode(vault, placement);
  return card;
}
