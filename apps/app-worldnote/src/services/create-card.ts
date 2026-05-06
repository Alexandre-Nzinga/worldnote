import type { WorldCard as LoreCard } from "@worldnote/shared";

/** Service layer stub — coordinates templates + validation + IPC. */
export async function createCardStub(_draft: Partial<LoreCard>): Promise<void> {
  // invoke Rust command in MVP
}
