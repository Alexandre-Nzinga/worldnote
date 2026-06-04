import { describe, expect, it } from "vitest";
import type { WorldCard } from "@worldnote/shared";
import { cardsInGroup, isGroupMemberHiddenOnCanvas } from "./groupMemberCards.js";

function stubCard(id: string, parent_id: string | null): WorldCard {
  return {
    id,
    name: id,
    parent_id,
    position: { x: 0, y: 0 },
    tags: [],
    card_type: "character",
  } as unknown as WorldCard;
}

describe("cardsInGroup", () => {
  it("returns cards whose parent_id matches the group", () => {
    const group = stubCard("g1", null);
    const a = stubCard("a", "g1");
    const b = stubCard("b", "g1");
    const other = stubCard("c", null);
    const byId = {
      [group.id]: group,
      [a.id]: a,
      [b.id]: b,
      [other.id]: other,
    };
    expect(cardsInGroup("g1", byId).map((c) => c.id).sort()).toEqual([
      "a",
      "b",
    ]);
  });
});

describe("isGroupMemberHiddenOnCanvas", () => {
  it("hides group members that are not on the canvas manifest", () => {
    const group = stubCard("g1", null);
    (group as WorldCard).card_type = "group";
    const member = stubCard("a", "g1");
    const byId = { g1: group as WorldCard, a: member };
    expect(isGroupMemberHiddenOnCanvas(member, byId, new Set())).toBe(true);
    expect(isGroupMemberHiddenOnCanvas(member, byId, new Set(["a"]))).toBe(
      false,
    );
  });
});
