import { invoke } from "@tauri-apps/api/core";
import {
  getSocketDescriptor,
  LinkSchema,
  type Link,
  type WorldCard,
} from "@worldnote/shared";
import { deleteLink } from "./deleteLink.js";
import { listLinks } from "./listLinks.js";

type CreateLinkInput = {
  vault: string;
  sourceCard: WorldCard;
  sourceSocket: string;
  targetCard: WorldCard;
};

export async function createLink({
  vault,
  sourceCard,
  sourceSocket,
  targetCard,
}: CreateLinkInput): Promise<Link> {
  const descriptor = getSocketDescriptor(sourceCard.card_type, sourceSocket);
  if (!descriptor) {
    throw new Error(
      `Socket "${sourceSocket}" is not defined for ${sourceCard.card_type} cards`,
    );
  }
  if (!descriptor.accepts.includes(targetCard.card_type)) {
    throw new Error(
      `Socket "${sourceSocket}" cannot accept a ${targetCard.card_type} card`,
    );
  }
  if (sourceCard.id === targetCard.id) {
    throw new Error("A link cannot connect a card to itself");
  }

  if (descriptor.cardinality === "single") {
    const existing = await listLinks(vault);
    await Promise.all(
      existing
        .filter(
          (link) =>
            link.source_card === sourceCard.id &&
            link.source_socket === sourceSocket,
        )
        .map((link) => deleteLink(vault, link.id)),
    );
  }

  const draft: Link = {
    id: crypto.randomUUID(),
    source_card: sourceCard.id,
    source_socket: sourceSocket,
    target_card: targetCard.id,
  };
  const link = LinkSchema.parse(draft);
  await invoke<void>("upsert_link", { vault, link });
  return link;
}
