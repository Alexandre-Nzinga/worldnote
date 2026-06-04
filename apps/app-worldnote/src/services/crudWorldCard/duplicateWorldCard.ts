import { invoke } from "@tauri-apps/api/core";
import { WorldCardSchema, type WorldCard } from "@worldnote/shared";

export type DuplicateWorldCardOptions = {
  /** When false, the card is not added to `canvas_manifest.json` (group-only members). */
  registerOnCanvas?: boolean;
};

export async function duplicateWorldCard(
  vault: string,
  cardId: string,
  offset: { x: number; y: number } = { x: 48, y: 48 },
  options: DuplicateWorldCardOptions = {},
): Promise<WorldCard> {
  const raw = await invoke<unknown>("duplicate_card", {
    vault,
    cardId,
    offsetX: offset.x,
    offsetY: offset.y,
    registerOnCanvas: options.registerOnCanvas ?? true,
  });
  return WorldCardSchema.parse(raw);
}
