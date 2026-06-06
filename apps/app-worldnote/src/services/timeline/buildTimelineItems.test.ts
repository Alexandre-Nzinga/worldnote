import { describe, expect, it } from "vitest";
import type { WorldCard } from "@worldnote/shared";
import { buildTimelineItems } from "./buildTimelineItems.js";

describe("buildTimelineItems", () => {
  it("includes characters with legacy birthdate strings", () => {
    const paul = {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Paul Atreides",
      card_type: "character",
      parent_id: null,
      position: { x: 0, y: 0 },
      tags: [],
      birthdate: "10191 AG",
      custom_properties: {},
    } as WorldCard;

    const { items } = buildTimelineItems({
      cardsById: { [paul.id]: paul },
      eras: [],
      periods: [],
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.content).toContain("Paul Atreides");
    expect(items[0]?.start.getUTCFullYear()).toBe(10191);
  });
});
