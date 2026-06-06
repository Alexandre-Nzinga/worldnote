import { invoke } from "@tauri-apps/api/core";
import {
  trackPersist,
  type PersistOptions,
} from "../../hooks/useSaveStatus.js";
import {
  getSocketDescriptor,
  LinkSchema,
  type Link,
  type WorldCard,
} from "@worldnote/shared";
import { deleteLink } from "./deleteLink.js";
import { listLinks } from "./listLinks.js";
import { recordRecentLinkTarget } from "./recentLinkTargets.js";
import {
  reciprocalKinshipLink,
  type CharacterCard,
} from "./resolveCharacterKinship.js";

type CreateLinkInput = {
  vault: string;
  sourceCard: WorldCard;
  sourceSocket: string;
  targetCard: WorldCard;
  /** When false, skips mirroring father/mother ↔ issue on the other character. */
  mirrorKinship?: boolean;
  notify?: boolean;
};

function isCharacter(card: WorldCard): card is CharacterCard {
  return card.card_type === "character";
}

function linkAlreadyExists(
  links: Link[],
  sourceCardId: string,
  sourceSocket: string,
  targetCardId: string,
): boolean {
  return links.some(
    (l) =>
      l.source_card === sourceCardId &&
      l.source_socket === sourceSocket &&
      l.target_card === targetCardId,
  );
}

async function upsertLinkRecord(vault: string, link: Link): Promise<void> {
  await invoke<void>("upsert_link", { vault, link });
}

export async function createLink({
  vault,
  sourceCard,
  sourceSocket,
  targetCard,
  mirrorKinship = true,
  notify,
}: CreateLinkInput): Promise<Link> {
  const persistOptions: PersistOptions | undefined =
    notify === undefined ? undefined : { notify };
  return trackPersist(async () => {
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

    let existing = await listLinks(vault);

    if (descriptor.cardinality === "single") {
      await Promise.all(
        existing
          .filter(
            (link) =>
              link.source_card === sourceCard.id &&
              link.source_socket === sourceSocket,
          )
          .map((link) => deleteLink(vault, link.id)),
      );
      existing = await listLinks(vault);
    }

    const draft: Link = {
      id: crypto.randomUUID(),
      source_card: sourceCard.id,
      source_socket: sourceSocket,
      target_card: targetCard.id,
    };
    const link = LinkSchema.parse(draft);
    await upsertLinkRecord(vault, link);

    if (
      mirrorKinship &&
      isCharacter(sourceCard) &&
      isCharacter(targetCard)
    ) {
      const reciprocal = reciprocalKinshipLink(
        sourceCard,
        sourceSocket,
        targetCard,
      );
      if (reciprocal) {
        existing = await listLinks(vault);
        const alreadyMirrored = linkAlreadyExists(
          existing,
          reciprocal.sourceCard.id,
          reciprocal.sourceSocket,
          reciprocal.targetCard.id,
        );
        if (!alreadyMirrored) {
          const mirrorDescriptor = getSocketDescriptor(
            reciprocal.sourceCard.card_type,
            reciprocal.sourceSocket,
          );
          if (mirrorDescriptor?.cardinality === "single") {
            await Promise.all(
              existing
                .filter(
                  (l) =>
                    l.source_card === reciprocal.sourceCard.id &&
                    l.source_socket === reciprocal.sourceSocket,
                )
                .map((l) => deleteLink(vault, l.id)),
            );
          }
          const mirrorDraft: Link = {
            id: crypto.randomUUID(),
            source_card: reciprocal.sourceCard.id,
            source_socket: reciprocal.sourceSocket,
            target_card: reciprocal.targetCard.id,
          };
          const mirrorLink = LinkSchema.parse(mirrorDraft);
          await upsertLinkRecord(vault, mirrorLink);
        }
      }
    }

    recordRecentLinkTarget(vault, targetCard.id);
    return link;
  }, persistOptions);
}
