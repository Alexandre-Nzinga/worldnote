import { describe, expect, it } from "vitest";
import type { WorldCard } from "@worldnote/shared";
import {
  normalizeCardSearchQuery,
  searchCanvasCards,
} from "./searchCanvasCards.js";

function card(
  id: string,
  name: string,
  overrides: Partial<WorldCard> = {},
): WorldCard {
  return {
    id,
    name,
    card_type: "character",
    parent_id: null,
    position: { x: 0, y: 0 },
    tags: [],
    custom_properties: {},
    ...overrides,
  } as WorldCard;
}

describe("normalizeCardSearchQuery", () => {
  it("strips wikilink brackets", () => {
    expect(normalizeCardSearchQuery("[[Paul Atreides]]")).toBe("paul atreides");
    expect(normalizeCardSearchQuery("[[Ghan")).toBe("ghan");
  });
});

describe("searchCanvasCards", () => {
  const paul = card("00000000-0000-4000-8000-000000000001", "Paul Atreides", {
    tags: ["kwisatz-haderach"],
  });
  const jessica = card("00000000-0000-4000-8000-000000000002", "Lady Jessica", {
    lore: "Mentor on Caladan.",
  });

  it("matches by name", () => {
    const hits = searchCanvasCards([paul, jessica], "paul");
    expect(hits).toHaveLength(1);
    expect(hits[0]?.cardId).toBe(paul.id);
    expect(hits[0]?.matchKind).toBe("name");
  });

  it("matches by tag", () => {
    const hits = searchCanvasCards([paul, jessica], "kwisatz");
    expect(hits[0]?.cardId).toBe(paul.id);
    expect(hits[0]?.matchKind).toBe("tag");
  });

  it("matches by lore markdown body", () => {
    const hits = searchCanvasCards([paul, jessica], "caladan");
    expect(hits[0]?.cardId).toBe(jessica.id);
    expect(hits[0]?.matchKind).toBe("lore");
  });

  it("matches wikilink-style name queries", () => {
    const hits = searchCanvasCards([paul, jessica], "[[Lady");
    expect(hits[0]?.cardId).toBe(jessica.id);
  });
});
