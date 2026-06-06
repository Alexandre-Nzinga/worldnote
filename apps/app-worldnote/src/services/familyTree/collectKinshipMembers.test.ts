import { describe, expect, it } from "vitest";
import type { Link, WorldCard } from "@worldnote/shared";
import { buildFamilyGraph } from "./buildFamilyGraph.js";
import { collectKinshipMembers } from "./collectKinshipMembers.js";

function character(id: string): WorldCard {
  return {
    id,
    name: id,
    card_type: "character",
    parent_id: null,
    position: { x: 0, y: 0 },
    tags: [],
    custom_properties: {},
  };
}

function kinshipLink(
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

describe("collectKinshipMembers", () => {
  it("collects the anchor and all connected relatives", () => {
    const parent = character("p");
    const child = character("c");
    const spouse = character("s");
    const stranger = character("x");
    const links = [
      kinshipLink(child.id, "father", parent.id),
      kinshipLink(parent.id, "spouse", spouse.id),
    ];
    const graph = buildFamilyGraph(
      [parent, child, spouse, stranger],
      links,
    );

    expect(
      collectKinshipMembers(graph, [child.id]).sort(),
    ).toEqual([child.id, parent.id, spouse.id].sort());
  });

  it("unions components from multiple anchors", () => {
    const shared = character("shared");
    const branchA = character("a");
    const branchB = character("b");
    const links = [
      kinshipLink(branchA.id, "father", shared.id),
      kinshipLink(branchB.id, "mother", shared.id),
    ];
    const graph = buildFamilyGraph([shared, branchA, branchB], links);

    expect(
      collectKinshipMembers(graph, [branchA.id, branchB.id]).sort(),
    ).toEqual([shared.id, branchA.id, branchB.id].sort());
  });
});
