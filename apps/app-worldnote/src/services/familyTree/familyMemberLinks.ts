import type { Link } from "@worldnote/shared";

export type FamilyMemberLinkDelta = {
  memberIdsToAdd: string[];
  memberLinksToRemove: Link[];
  affiliationLinksToRemove: Link[];
};

export function familyMemberIdsFromLinks(
  familyCardId: string,
  links: readonly Link[],
): Set<string> {
  const memberIds = new Set<string>();
  for (const link of links) {
    if (
      link.source_card === familyCardId &&
      link.source_socket === "members"
    ) {
      memberIds.add(link.target_card);
    }
  }
  return memberIds;
}

export function computeFamilyMemberLinkDelta(
  familyCardId: string,
  desiredMemberIds: readonly string[],
  links: readonly Link[],
): FamilyMemberLinkDelta {
  const desired = new Set(desiredMemberIds);
  const current = familyMemberIdsFromLinks(familyCardId, links);

  const memberIdsToAdd = [...desired].filter((id) => !current.has(id));

  const memberLinksToRemove: Link[] = [];
  const affiliationLinksToRemove: Link[] = [];

  for (const link of links) {
    if (
      link.source_card === familyCardId &&
      link.source_socket === "members" &&
      !desired.has(link.target_card)
    ) {
      memberLinksToRemove.push(link);
      continue;
    }
    if (
      link.source_card !== familyCardId &&
      link.source_socket === "affiliations" &&
      link.target_card === familyCardId &&
      !desired.has(link.source_card)
    ) {
      affiliationLinksToRemove.push(link);
    }
  }

  return { memberIdsToAdd, memberLinksToRemove, affiliationLinksToRemove };
}

export function affiliationLinkExists(
  characterId: string,
  familyCardId: string,
  links: readonly Link[],
): boolean {
  return links.some(
    (link) =>
      link.source_card === characterId &&
      link.source_socket === "affiliations" &&
      link.target_card === familyCardId,
  );
}
