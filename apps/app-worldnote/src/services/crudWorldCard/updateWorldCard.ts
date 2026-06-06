import { WorldCardSchema, type WorldCard } from "@worldnote/shared";
import { invoke } from "@tauri-apps/api/core";
import {
  type PersistOptions,
  trackPersist,
} from "../../hooks/useSaveStatus.js";

export async function updateWorldCard(
  vault: string,
  card: WorldCard,
  options?: PersistOptions,
): Promise<WorldCard> {
  return trackPersist(async () => {
    const validated = WorldCardSchema.parse(card);
    await invoke<void>("upsert_card", { vault, card: validated });
    return validated;
  }, options);
}
