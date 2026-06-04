import { describe, expect, it } from "vitest";
import type { WorldCard } from "@worldnote/shared";
import {
  expandCardIdsIncludingGroupMembers,
  sortCardIdsForGroupDuplicate,
} from "./duplicateWorldCardsWithGroup.js";

function stubCard(
  id: string,
  card_type: WorldCard["card_type"],
  parent_id: string | null = null,
): WorldCard {
  return {
    id,
    name: id,
    parent_id,
    position: { x: 0, y: 0 },
    tags: [],
    card_type,
  } as WorldCard;
}

describe("expandCardIdsIncludingGroupMembers", () => {
  it("adds group members when a group card is included", () => {
    const group = stubCard("g1", "group");
    const a = stubCard("a", "character", "g1");
    const byId = { g1: group, a };

    expect(expandCardIdsIncludingGroupMembers(["g1"], byId).sort()).toEqual([
      "a",
      "g1",
    ]);
  });

  it("leaves non-group selections unchanged", () => {
    const card = stubCard("c1", "character");
    expect(expandCardIdsIncludingGroupMembers(["c1"], { c1: card })).toEqual([
      "c1",
    ]);
  });
});

describe("sortCardIdsForGroupDuplicate", () => {
  it("orders group cards before their members", () => {
    const group = stubCard("g1", "group");
    const a = stubCard("a", "character", "g1");
    const b = stubCard("b", "location", "g1");
    const byId = { g1: group, a, b };

    expect(sortCardIdsForGroupDuplicate(["a", "g1", "b"], byId)).toEqual([
      "g1",
      "a",
      "b",
    ]);
  });
});
