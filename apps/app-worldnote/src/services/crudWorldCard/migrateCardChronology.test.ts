import { describe, expect, it } from "vitest";
import type { WorldCard } from "@worldnote/shared";
import { migrateCardChronology } from "./migrateCardChronology.js";

describe("migrateCardChronology", () => {
  it("migrates legacy character birthdate/deathdate strings to integer years", () => {
    const legacy = {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Paul",
      card_type: "character",
      parent_id: null,
      position: { x: 0, y: 0 },
      tags: [],
      birthdate: "Year 10191 AG",
      deathdate: "10210",
      custom_properties: {},
    };

    const { card, changed } = migrateCardChronology(legacy as WorldCard);

    expect(changed).toBe(true);
    if (card.card_type !== "character") {
      throw new Error("expected character card");
    }
    expect(card.start_year).toBe(10191);
    expect(card.end_year).toBe(10210);
    expect("birthdate" in card).toBe(false);
    expect("deathdate" in card).toBe(false);
  });

  it("is idempotent when legacy fields are already gone", () => {
    const card: WorldCard = {
      id: "00000000-0000-4000-8000-000000000002",
      name: "Battle",
      card_type: "event",
      parent_id: null,
      position: { x: 0, y: 0 },
      tags: [],
      start_year: -500,
      custom_properties: {},
    };

    const result = migrateCardChronology(card);
    expect(result.changed).toBe(false);
    expect(result.card).toEqual(card);
  });
});
