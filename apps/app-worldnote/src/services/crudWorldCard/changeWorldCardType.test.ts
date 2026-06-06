import { describe, expect, it } from "vitest";
import type { WorldCard } from "@worldnote/shared";
import { changeWorldCardType } from "./changeWorldCardType.js";

function stubCharacter(): WorldCard {
  return {
    id: "card-1",
    name: "Paul",
    card_type: "character",
    parent_id: null,
    position: { x: 10, y: 20 },
    tags: ["hero"],
    start_year: 10191,
    lore: "The messiah",
    custom_properties: {},
  };
}

describe("changeWorldCardType", () => {
  it("preserves identity and shared fields when re-typing", () => {
    const card = stubCharacter();
    const next = changeWorldCardType(card, "location");

    expect(next.id).toBe("card-1");
    expect(next.card_type).toBe("location");
    expect(next.name).toBe("Paul");
    expect(next.position).toEqual({ x: 10, y: 20 });
    expect(next.tags).toEqual(["hero"]);
    expect(next.lore).toBe("The messiah");
    expect("start_year" in next).toBe(false);
  });
});
