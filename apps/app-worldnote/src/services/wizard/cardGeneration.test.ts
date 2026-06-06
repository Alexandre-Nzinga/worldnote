import { describe, expect, it } from "vitest";
import {
  isFieldEmpty,
  listGeneratableFields,
  type WorldCard,
} from "@worldnote/shared";
import { buildGenerationSchema } from "./cardGeneration.js";

function character(id: string, name: string): WorldCard {
  return {
    id,
    name,
    card_type: "character",
    parent_id: null,
    position: { x: 0, y: 0 },
    tags: [],
    custom_properties: {},
  };
}

describe("buildGenerationSchema", () => {
  it("includes name for new-card generation", () => {
    const schema = buildGenerationSchema("character", { includeName: true });
    expect(schema.required).toEqual(["name"]);
    expect(schema.properties).toHaveProperty("name");
    expect(schema.properties).toHaveProperty("race");
    expect(schema.properties).toHaveProperty("gender");
  });

  it("includes type-specific fields for all major card types", () => {
    const location = buildGenerationSchema("location");
    expect(location.properties).toHaveProperty("coordinates");

    const item = buildGenerationSchema("item");
    expect(item.properties).toHaveProperty("rarity");
    expect(item.properties).toHaveProperty("weight");

    const vehicle = buildGenerationSchema("vehicle");
    expect(vehicle.properties).toHaveProperty("sub_type");
    expect(vehicle.properties).toHaveProperty("max_speed");

    const spell = buildGenerationSchema("spell");
    expect(spell.properties).toHaveProperty("lore");
    expect(spell.properties).not.toHaveProperty("sub_type");
  });

  it("restricts schema to requested fields for fill-gaps", () => {
    const schema = buildGenerationSchema("location", {
      fields: ["lore", "coordinates"],
    });
    const keys = Object.keys(
      schema.properties as Record<string, unknown>,
    );
    expect(keys).toEqual(["lore", "coordinates"]);
  });
});

describe("listGeneratableFields", () => {
  it("lists character-specific fields", () => {
    const fields = listGeneratableFields("character");
    expect(fields).toContain("lore");
    expect(fields).toContain("race");
    expect(fields).toContain("appearance");
  });
});

describe("isFieldEmpty", () => {
  it("detects empty lore on a card", () => {
    const card = character("00000000-0000-4000-8000-000000000001", "Aria");
    expect(isFieldEmpty(card, "lore")).toBe(true);
    expect(isFieldEmpty({ ...card, lore: "Some lore" }, "lore")).toBe(false);
  });
});
