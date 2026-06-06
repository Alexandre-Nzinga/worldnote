import { describe, expect, it } from "vitest";
import type { Link, WorldCard } from "@worldnote/shared";
import { buildGraphData } from "./buildGraphData.js";

function stubCharacter(id: string, name: string): WorldCard {
  return {
    id,
    name,
    parent_id: null,
    position: { x: 0, y: 0 },
    tags: [],
    card_type: "character",
  } as unknown as WorldCard;
}

function stubLocation(id: string, name: string): WorldCard {
  return {
    id,
    name,
    parent_id: null,
    position: { x: 0, y: 0 },
    tags: [],
    card_type: "location",
  } as unknown as WorldCard;
}

function stubLink(
  id: string,
  sourceCard: string,
  sourceSocket: string,
  targetCard: string,
): Link {
  return {
    id,
    source_card: sourceCard,
    source_socket: sourceSocket,
    target_card: targetCard,
  };
}

describe("buildGraphData", () => {
  it("maps cards to nodes and socket links to edges", () => {
    const mother = stubCharacter("mother-id", "Elena");
    const child = stubCharacter("child-id", "Aria");
    const birthplace = stubLocation("place-id", "Silverhold");
    const spouse = stubCharacter("spouse-id", "Marcus");

    const cards = [mother, child, birthplace, spouse];
    const links = [
      stubLink("link-1", child.id, "mother", mother.id),
      stubLink("link-2", child.id, "birthplace", birthplace.id),
      stubLink("link-3", child.id, "spouse", spouse.id),
    ];

    const graph = buildGraphData(cards, links);

    expect(graph.nodes).toHaveLength(4);
    expect(graph.nodes.find((node) => node.id === child.id)).toEqual({
      id: child.id,
      label: "Aria",
      kind: "card",
      cardType: "character",
      tags: [],
    });

    expect(graph.links).toHaveLength(3);
    expect(graph.links).toEqual(
      expect.arrayContaining([
        {
          id: "link-1",
          source: child.id,
          target: mother.id,
          socket: "mother",
        },
        {
          id: "link-2",
          source: child.id,
          target: birthplace.id,
          socket: "birthplace",
        },
        {
          id: "link-3",
          source: child.id,
          target: spouse.id,
          socket: "spouse",
        },
      ]),
    );
  });

  it("skips links whose endpoints are missing from the card set", () => {
    const card = stubCharacter("only-id", "Solo");
    const links = [
      stubLink("orphan-link", card.id, "mother", "missing-mother"),
    ];

    const graph = buildGraphData([card], links);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.links).toHaveLength(0);
  });
});
