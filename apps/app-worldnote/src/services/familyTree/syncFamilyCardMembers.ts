import type { FamilyCard, Link, WorldCard } from "@worldnote/shared";
import { createLink } from "../links/createLink.js";
import { deleteLink } from "../links/deleteLink.js";
import { listLinks } from "../links/listLinks.js";
import type { FamilyGraph } from "./buildFamilyGraph.js";
import { collectKinshipMembers } from "./collectKinshipMembers.js";
import {
  affiliationLinkExists,
  computeFamilyMemberLinkDelta,
} from "./familyMemberLinks.js";

type SyncFamilyCardMembersInput = {
  vault: string;
  familyCard: FamilyCard;
  graph: FamilyGraph;
  links: readonly Link[];
  cardsById: Record<string, WorldCard>;
  /** Extra anchors when the family was created from a multi-select. */
  extraAnchorIds?: readonly string[];
};

export type SyncFamilyCardMembersResult = {
  changed: boolean;
  links: Link[];
};

function isCharacter(card: WorldCard | undefined): card is Extract<
  WorldCard,
  { card_type: "character" }
> {
  return card?.card_type === "character";
}

/** Keeps `family.members` (and character `affiliations`) aligned with the kinship graph. */
export async function syncFamilyCardMembers({
  vault,
  familyCard,
  graph,
  links,
  cardsById,
  extraAnchorIds = [],
}: SyncFamilyCardMembersInput): Promise<SyncFamilyCardMembersResult> {
  const anchorId = familyCard.anchor_character_id;
  if (!anchorId) {
    return { changed: false, links: [...links] };
  }

  const anchorIds = [anchorId, ...extraAnchorIds];
  const desiredMemberIds = collectKinshipMembers(graph, anchorIds);
  const delta = computeFamilyMemberLinkDelta(
    familyCard.id,
    desiredMemberIds,
    links,
  );

  if (
    delta.memberIdsToAdd.length === 0 &&
    delta.memberLinksToRemove.length === 0 &&
    delta.affiliationLinksToRemove.length === 0
  ) {
    return { changed: false, links: [...links] };
  }

  for (const link of [
    ...delta.memberLinksToRemove,
    ...delta.affiliationLinksToRemove,
  ]) {
    await deleteLink(vault, link.id);
  }

  let workingLinks = await listLinks(vault);

  for (const memberId of delta.memberIdsToAdd) {
    const memberCard = cardsById[memberId];
    if (!isCharacter(memberCard)) {
      continue;
    }

    const memberLinkExists = workingLinks.some(
      (link) =>
        link.source_card === familyCard.id &&
        link.source_socket === "members" &&
        link.target_card === memberId,
    );
    if (!memberLinkExists) {
      await createLink({
        vault,
        sourceCard: familyCard,
        sourceSocket: "members",
        targetCard: memberCard,
        mirrorKinship: false,
        notify: false,
      });
      workingLinks = await listLinks(vault);
    }

    if (
      !affiliationLinkExists(memberId, familyCard.id, workingLinks)
    ) {
      await createLink({
        vault,
        sourceCard: memberCard,
        sourceSocket: "affiliations",
        targetCard: familyCard,
        mirrorKinship: false,
        notify: false,
      });
      workingLinks = await listLinks(vault);
    }
  }

  return { changed: true, links: workingLinks };
}
