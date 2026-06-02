import { invoke } from "@tauri-apps/api/core";
import { WorldCardSchema, type WorldCard } from "@worldnote/shared";

export async function duplicateWorldCard(
  vault: string,
  cardId: string,
  offset: { x: number; y: number } = { x: 48, y: 48 },
): Promise<WorldCard> {
  const raw = await invoke<unknown>("duplicate_card", {
    vault,
    cardId,
    offsetX: offset.x,
    offsetY: offset.y,
  });
  return WorldCardSchema.parse(raw);
}
