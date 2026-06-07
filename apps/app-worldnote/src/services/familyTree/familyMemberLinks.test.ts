import { describe, expect, it } from "vitest";
import type { Link } from "@worldnote/shared";
import { computeFamilyMemberLinkDelta } from "./familyMemberLinks.js";

function link(
  sourceCard: string,
  sourceSocket: string,
  targetCard: string,
): Link {
  return {
    id: crypto.randomUUID(),
    source_card: sourceCard,
    source_socket: sourceSocket,
    target_card: targetCard,
  };
}

describe("computeFamilyMemberLinkDelta", () => {
  it("adds missing members and removes stale links", () => {
    const familyId = "family";
    const keepId = "keep";
    const addId = "add";
    const removeId = "remove";
    const links = [
      link(familyId, "members", keepId),
      link(familyId, "members", removeId),
      link(removeId, "affiliations", familyId),
    ];

    const delta = computeFamilyMemberLinkDelta(
      familyId,
      [keepId, addId],
      links,
    );

    expect(delta.memberIdsToAdd).toEqual([addId]);
    expect(delta.memberLinksToRemove.map((entry) => entry.target_card)).toEqual(
      [removeId],
    );
    expect(
      delta.affiliationLinksToRemove.map((entry) => entry.source_card),
    ).toEqual([removeId]);
  });
});
