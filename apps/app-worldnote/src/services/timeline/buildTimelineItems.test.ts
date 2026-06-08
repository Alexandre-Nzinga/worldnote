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
      chronology: [],
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.content).toContain("Paul Atreides");
    expect(items[0]?.start.getUTCFullYear()).toBe(10191);
  });

  it("skips characters with invalid timeline years", () => {
    const leto = {
      id: "00000000-0000-4000-8000-000000000002",
      name: "Leto Atreides",
      card_type: "character",
      parent_id: null,
      position: { x: 0, y: 0 },
      tags: [],
      custom_properties: {},
      gender: "male",
      start_year: 1_890_475_600_000_000,
    } as WorldCard;

    const { items } = buildTimelineItems({
      cardsById: { [leto.id]: leto },
      chronology: [],
    });

    expect(items).toHaveLength(0);
  });

  it("applies period colors to chronology bars", () => {
    const { items } = buildTimelineItems({
      cardsById: {},
      chronology: [
        {
          id: "00000000-0000-4000-8000-000000000010",
          name: "Golden Age",
          start_year: 0,
          end_year: 500,
          color: "#6366f1",
        },
      ],
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.style).toContain("#6366f1");
  });
});
