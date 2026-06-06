import { describe, expect, it } from "vitest";
import type { WorldCard } from "@worldnote/shared";
import { analyzeWizardSuggestions, buildSuggestionLabel } from "./analyzeSuggestions.js";

const ariaId = "00000000-0000-4000-8000-000000000001";
const silverholdId = "00000000-0000-4000-8000-000000000002";

function character(id: string, name: string, lore?: string): WorldCard {
  return {
    id,
    name,
    card_type: "character",
    parent_id: null,
    position: { x: 0, y: 0 },
    tags: [],
    custom_properties: {},
    lore,
  };
}

function location(id: string, name: string, lore?: string): WorldCard {
  return {
    id,
    name,
    card_type: "location",
    parent_id: null,
    position: { x: 0, y: 0 },
    tags: [],
    custom_properties: {},
    lore,
  };
}

describe("buildSuggestionLabel", () => {
  it("uses Generate for lore-like fields and Fill for type fields", () => {
    expect(buildSuggestionLabel("lore")).toBe("Generate lore");
    expect(buildSuggestionLabel("description")).toBe("Generate description");
    expect(buildSuggestionLabel("race")).toBe("Fill race");
  });
});

describe("analyzeWizardSuggestions", () => {
  it("does not suggest changes for linked cards with empty fields", () => {
    const aria = character(ariaId, "Aria");
    const silverhold = location(silverholdId, "Silverhold");

    const suggestions = analyzeWizardSuggestions({
      selectedCard: aria,
    });

    expect(suggestions.every((s) => s.targetCardId === ariaId)).toBe(true);
    expect(suggestions.find((s) => s.targetCardId === silverholdId)).toBeUndefined();
  });

  it("suggests self fill-gaps when selected card has empty lore", () => {
    const aria = character(ariaId, "Aria");

    const suggestions = analyzeWizardSuggestions({
      selectedCard: aria,
    });

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]?.targetCardId).toBe(ariaId);
    expect(suggestions[0]?.label).toBe("Generate lore");
    expect(suggestions[0]?.message).toContain("Aria");
    expect(suggestions[0]?.message).toContain("lore");
  });

  it("returns no suggestions when primary creative fields are populated", () => {
    const spellId = "00000000-0000-4000-8000-000000000003";
    const fireball = {
      id: spellId,
      name: "Fireball",
      card_type: "spell" as const,
      parent_id: null,
      position: { x: 0, y: 0 },
      tags: ["combat"],
      custom_properties: {},
      lore: "A burst of flame.",
      subtitle: "Evocation",
      description: "Classic arcane fire spell.",
    };

    const suggestions = analyzeWizardSuggestions({
      selectedCard: fireball,
    });

    expect(suggestions).toHaveLength(0);
  });

  it("only suggests gaps on the selected card when it also has links", () => {
    const aria = character(ariaId, "Aria");

    const suggestions = analyzeWizardSuggestions({
      selectedCard: aria,
    });

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]?.targetCardId).toBe(ariaId);
  });
});
