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
    lore_doc: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "cardMention",
              attrs: { id: paul.id, label: "Duke Paul" },
            },
          ],
        },
      ],
    },
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

  it("matches by mention label in lore", () => {
    const hits = searchCanvasCards([paul, jessica], "duke paul");
    expect(hits[0]?.cardId).toBe(paul.id);
    expect(hits[0]?.matchKind).toBe("mention");
  });

  it("matches mention labels in Quill Delta lore docs", () => {
    const chani = card("00000000-0000-4000-8000-000000000003", "Chani", {
      lore_doc: {
        ops: [
          { insert: "Beloved of " },
          { insert: { "card-mention": { id: paul.id, label: "Usul" } } },
          { insert: "\n" },
        ],
      },
    });
    const hits = searchCanvasCards([paul, chani], "usul");
    expect(hits[0]?.cardId).toBe(paul.id);
    expect(hits[0]?.matchKind).toBe("mention");
  });

  it("matches wikilink-style name queries", () => {
    const hits = searchCanvasCards([paul, jessica], "[[Lady");
    expect(hits[0]?.cardId).toBe(jessica.id);
  });
});
