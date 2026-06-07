import { describe, expect, it } from "vitest";
import type { WorldCard } from "@worldnote/shared";
import type { RelationsToAnchor } from "./computeRelationsToAnchor.js";
import { familyTreeNodeStateForCard } from "./familyTreeNodeState.js";

function character(id: string, name = id): WorldCard {
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

function relations(
  entries: Array<[string, { related: boolean; kinshipLabel: string }]>,
): RelationsToAnchor {
  return new Map(entries);
}

describe("familyTreeNodeStateForCard", () => {
  const anchor = character("anchor");
  const related = character("related");
  const unrelated = character("unrelated");
  const location = { ...character("place"), card_type: "location" as const };

  it("returns null when family tree is inactive", () => {
    expect(familyTreeNodeStateForCard(anchor, null, relations([]))).toBeNull();
  });

  it("returns null for non-character cards", () => {
    expect(
      familyTreeNodeStateForCard(
        location,
        anchor.id,
        relations([[location.id, { related: false, kinshipLabel: "" }]]),
      ),
    ).toBeNull();
  });

  it("keeps the anchor visible without a kinship label", () => {
    expect(
      familyTreeNodeStateForCard(
        anchor,
        anchor.id,
        relations([[related.id, { related: true, kinshipLabel: "Child" }]]),
      ),
    ).toEqual({ hidden: false });
  });

  it("shows kinship labels on related characters", () => {
    expect(
      familyTreeNodeStateForCard(
        related,
        anchor.id,
        relations([[related.id, { related: true, kinshipLabel: "Child" }]]),
      ),
    ).toEqual({ hidden: false, kinshipLabel: "Child" });
  });

  it("hides unrelated characters when mode is hide", () => {
    expect(
      familyTreeNodeStateForCard(
        unrelated,
        anchor.id,
        relations([[unrelated.id, { related: false, kinshipLabel: "" }]]),
        "hide",
      ),
    ).toEqual({ hidden: true });
  });

  it("dims unrelated characters when mode is dim", () => {
    expect(
      familyTreeNodeStateForCard(
        unrelated,
        anchor.id,
        relations([[unrelated.id, { related: false, kinshipLabel: "" }]]),
        "dim",
      ),
    ).toEqual({ hidden: false, dimmed: true });
  });
});
