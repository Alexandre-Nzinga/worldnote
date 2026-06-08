import { describe, expect, it } from "vitest";
import {
  isFieldEmpty,
  listEmptyTypePropertyFields,
  listEmptyWizardGeneratableFields,
  listGeneratableFields,
  listTypePropertyFields,
  listWizardGeneratableFields,
  normalizeTimelineYear,
  type WorldCard,
} from "@worldnote/shared";
import {
  buildGenerationSchema,
  normalizeGeneratedSubtitle,
  normalizeGeneratedTags,
} from "./cardGeneration.js";

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
    expect(location.properties).toHaveProperty("lore");
    expect(location.properties).not.toHaveProperty("coordinates");

    const item = buildGenerationSchema("item");
    expect(item.properties).toHaveProperty("rarity");
    expect(item.properties).toHaveProperty("weight");

    const vehicle = buildGenerationSchema("vehicle");
    expect(vehicle.properties).toHaveProperty("sub_type");
    expect(vehicle.properties).toHaveProperty("max_speed");
    expect(
      (vehicle.properties as Record<string, { type: string }>).max_speed,
    ).toMatchObject({ type: "number", minimum: 0 });

    const spell = buildGenerationSchema("spell");
    expect(spell.properties).toHaveProperty("lore");
    expect(spell.properties).not.toHaveProperty("sub_type");
  });

  it("restricts schema to requested fields for fill-gaps", () => {
    const schema = buildGenerationSchema("item", {
      fields: ["lore", "rarity"],
    });
    const keys = Object.keys(schema.properties as Record<string, unknown>);
    expect(keys).toEqual(["lore", "rarity"]);
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

describe("normalizeTimelineYear", () => {
  it("rejects timestamp-scale values from wizard output", () => {
    expect(normalizeTimelineYear(1_890_475_600_000_000)).toBeUndefined();
  });
});

describe("normalizeGeneratedSubtitle", () => {
  it("keeps short subtitles unchanged", () => {
    expect(normalizeGeneratedSubtitle("Desert planet")).toBe("Desert planet");
    expect(normalizeGeneratedSubtitle("Spice trader")).toBe("Spice trader");
  });

  it("strips trailing sentence punctuation", () => {
    expect(normalizeGeneratedSubtitle("Desert planet.")).toBe("Desert planet");
  });

  it("truncates long sentence-like subtitles to five words", () => {
    expect(
      normalizeGeneratedSubtitle(
        "A harsh barren landscape known as Arrakis on the edge of the Old Imperium.",
      ),
    ).toBe("A harsh barren landscape known");
  });
});

describe("normalizeGeneratedTags", () => {
  it("replaces underscores with spaces", () => {
    expect(normalizeGeneratedTags(["spice_melange", "space_travel"])).toEqual([
      "spice melange",
      "space travel",
    ]);
  });

  it("trims and drops empty tags", () => {
    expect(normalizeGeneratedTags(["  foo_bar  ", "___", ""])).toEqual([
      "foo bar",
    ]);
  });
});

describe("isFieldEmpty", () => {
  it("detects empty lore on a card", () => {
    const card = character("00000000-0000-4000-8000-000000000001", "Aria");
    expect(isFieldEmpty(card, "lore")).toBe(true);
    expect(isFieldEmpty({ ...card, lore: "Some lore" }, "lore")).toBe(false);
  });
});

describe("listWizardGeneratableFields", () => {
  it("excludes description because it is derived from lore on save", () => {
    const fields = listWizardGeneratableFields("character");
    expect(fields).toContain("lore");
    expect(fields).not.toContain("description");
  });

  it("does not treat empty description as a wizard gap when lore exists", () => {
    const card = {
      ...character("00000000-0000-4000-8000-000000000001", "Arrakis"),
      lore: "Spice world.",
    };
    expect(listEmptyWizardGeneratableFields(card)).not.toContain("description");
  });
});

describe("listTypePropertyFields", () => {
  it("lists character property fields without narrative fields", () => {
    const fields = listTypePropertyFields("character");
    expect(fields).toContain("gender");
    expect(fields).toContain("start_year");
    expect(fields).not.toContain("lore");
    expect(fields).not.toContain("subtitle");
  });

  it("returns only empty type property fields for fill-gaps", () => {
    const card = {
      ...character("00000000-0000-4000-8000-000000000001", "Aria"),
      gender: "female" as const,
    };
    const empty = listEmptyTypePropertyFields(card);
    expect(empty).toContain("start_year");
    expect(empty).toContain("end_year");
    expect(empty).not.toContain("gender");
    expect(empty).not.toContain("lore");
  });
});
