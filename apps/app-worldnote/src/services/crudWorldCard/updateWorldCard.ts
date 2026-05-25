import { WorldCardSchema, type WorldCard } from "@worldnote/shared";
import { invoke } from "@tauri-apps/api/core";

export async function updateWorldCard(
  vault: string,
  card: WorldCard,
): Promise<WorldCard> {
  const validated = WorldCardSchema.parse(card);
  await invoke<void>("upsert_card", { vault, card: validated });
  return validated;
}
