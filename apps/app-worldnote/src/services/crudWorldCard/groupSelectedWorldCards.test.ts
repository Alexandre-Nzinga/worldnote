import { describe, expect, it } from "vitest";
import type { WorldCard } from "@worldnote/shared";
import { centerPositionForGroup } from "./groupSelectedWorldCards.js";

function cardAt(x: number, y: number): WorldCard {
  return {
    id: crypto.randomUUID(),
    name: "Test",
    card_type: "character",
    parent_id: null,
    position: { x, y },
    tags: [],
    custom_properties: {},
  };
}

describe("centerPositionForGroup", () => {
  it("returns the center of the selection bounds", () => {
    const center = centerPositionForGroup([
      cardAt(0, 0),
      cardAt(100, 200),
    ]);
    expect(center).toEqual({ x: 50, y: 100 });
  });
});
