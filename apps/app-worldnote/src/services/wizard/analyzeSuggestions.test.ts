import { describe, expect, it } from "vitest";
import type { Link, WorldCard } from "@worldnote/shared";
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

function link(
  sourceCard: string,
  sourceSocket: string,
  targetCard: string,
): Link {
  return {
    id: crypto.randomUUID(),
    source_card: sourceCard,
    source_socket: sourceSocket,
    target_card: targetCard,
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
  it("suggests filling linked location lore when character links to empty location", () => {
    const aria = character(ariaId, "Aria");
    const silverhold = location(silverholdId, "Silverhold");
    const cardsById = { [ariaId]: aria, [silverholdId]: silverhold };
    const links = [link(ariaId, "birthplace", silverholdId)];

    const suggestions = analyzeWizardSuggestions({
      selectedCard: aria,
      cardsById,
      links,
    });

    expect(suggestions.length).toBeGreaterThanOrEqual(1);
    const linked = suggestions.find((s) => s.targetCardId === silverholdId);
    expect(linked).toBeDefined();
    expect(linked?.action).toBe("fill-gaps");
    expect(linked?.label).toBe("Generate lore");
    expect(linked?.message).toContain("Aria");
    expect(linked?.message).toContain("Silverhold");
    expect(linked?.message).toContain("lore");
    expect(linked?.socketId).toBe("birthplace");
  });

  it("suggests self fill-gaps when selected card has empty lore", () => {
    const aria = character(ariaId, "Aria");
    const cardsById = { [ariaId]: aria };

    const suggestions = analyzeWizardSuggestions({
      selectedCard: aria,
      cardsById,
      links: [],
    });

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]?.targetCardId).toBe(ariaId);
    expect(suggestions[0]?.label).toBe("Generate lore");
    expect(suggestions[0]?.message).toContain("Aria");
    expect(suggestions[0]?.message).toContain("lore");
  });

  it("returns no suggestions when primary creative fields are populated", () => {
    const spellId = "00000000-0000-4000-8000-000000000003";
    const aria = {
      ...character(ariaId, "Aria", "A brave knight."),
      subtitle: "The Bold",
      description: "A brave knight of the realm.",
    };
    const silverhold = {
      ...location(silverholdId, "Silverhold", "A fortified city."),
      subtitle: "Fortress",
      description: "A fortified city on the northern coast.",
    };
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
    const cardsById = {
      [ariaId]: aria,
      [silverholdId]: silverhold,
      [spellId]: fireball,
    };
    const links = [
      link(ariaId, "birthplace", silverholdId),
      link(ariaId, "spells", spellId),
    ];

    const suggestions = analyzeWizardSuggestions({
      selectedCard: fireball,
      cardsById,
      links,
    });

    expect(suggestions).toHaveLength(0);
  });

  it("prioritizes linked-card gaps over self gaps", () => {
    const aria = character(ariaId, "Aria");
    const silverhold = location(silverholdId, "Silverhold");
    const cardsById = { [ariaId]: aria, [silverholdId]: silverhold };
    const links = [link(ariaId, "affiliations", silverholdId)];

    const suggestions = analyzeWizardSuggestions({
      selectedCard: aria,
      cardsById,
      links,
    });

    expect(suggestions.length).toBeGreaterThanOrEqual(2);
    expect(suggestions[0]?.targetCardId).toBe(silverholdId);
  });
});
