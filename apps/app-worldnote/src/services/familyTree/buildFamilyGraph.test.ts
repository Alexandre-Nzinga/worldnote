import { describe, expect, it } from "vitest";
import type { Link, WorldCard } from "@worldnote/shared";
import { buildFamilyGraph } from "./buildFamilyGraph.js";
import { hasKinshipPath } from "./hasKinshipPath.js";

function character(
  id: string,
  name: string,
  gender?: "male" | "female",
): WorldCard {
  return {
    id,
    name,
    card_type: "character",
    parent_id: null,
    position: { x: 0, y: 0 },
    tags: [],
    custom_properties: {},
    gender,
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

describe("buildFamilyGraph", () => {
  it("merges mother on child and issue on parent", () => {
    const mother = character("m", "Elena", "female");
    const child = character("c", "Aria");
    const links = [
      kinshipLink(child.id, "mother", mother.id),
      kinshipLink(mother.id, "issue", child.id),
    ];

    const graph = buildFamilyGraph([mother, child], links);

    expect(graph.parents.get(child.id)).toEqual({ mother: mother.id });
    expect(graph.children.get(mother.id)).toEqual(new Set([child.id]));
  });

  it("treats spouse links as undirected", () => {
    const a = character("a", "Alex", "male");
    const b = character("b", "Blair", "female");
    const links = [kinshipLink(a.id, "spouse", b.id)];

    const graph = buildFamilyGraph([a, b], links);

    expect(graph.spouses.get(a.id)).toEqual(new Set([b.id]));
    expect(graph.spouses.get(b.id)).toEqual(new Set([a.id]));
  });

  it("uses the last explicit father link as canonical and reports a conflict", () => {
    const child = character("c", "Child");
    const fatherA = character("fa", "Father A", "male");
    const fatherB = character("fb", "Father B", "male");
    const links = [
      kinshipLink(child.id, "father", fatherA.id),
      kinshipLink(child.id, "father", fatherB.id),
    ];

    const graph = buildFamilyGraph([child, fatherA, fatherB], links);

    expect(graph.parents.get(child.id)).toEqual({ father: fatherB.id });
    expect(graph.parentConflicts).toEqual([
      {
        childId: child.id,
        role: "father",
        canonicalParentId: fatherB.id,
        alternateParentIds: [fatherA.id],
      },
    ]);
    expect(graph.children.get(fatherA.id)).toEqual(new Set([child.id]));
    expect(graph.children.get(fatherB.id)).toEqual(new Set([child.id]));
  });

  it("prefers explicit father links over issue links for the same role", () => {
    const child = character("c", "Child");
    const fatherA = character("fa", "Father A", "male");
    const fatherB = character("fb", "Father B", "male");
    const links = [
      kinshipLink(fatherB.id, "issue", child.id),
      kinshipLink(child.id, "father", fatherA.id),
    ];

    const graph = buildFamilyGraph([child, fatherA, fatherB], links);

    expect(graph.parents.get(child.id)).toEqual({ father: fatherA.id });
    expect(graph.parentConflicts).toEqual([
      {
        childId: child.id,
        role: "father",
        canonicalParentId: fatherA.id,
        alternateParentIds: [fatherB.id],
      },
    ]);
  });

  it("does not report a conflict for mirrored father and issue links", () => {
    const child = character("c", "Child");
    const father = character("f", "Father", "male");
    const links = [
      kinshipLink(child.id, "father", father.id),
      kinshipLink(father.id, "issue", child.id),
    ];

    const graph = buildFamilyGraph([child, father], links);

    expect(graph.parents.get(child.id)).toEqual({ father: father.id });
    expect(graph.parentConflicts).toEqual([]);
  });

  it("ignores non-kinship sockets", () => {
    const child = character("c", "Child");
    const place = {
      id: "p",
      name: "Town",
      card_type: "location" as const,
      parent_id: null,
      position: { x: 0, y: 0 },
      tags: [],
      custom_properties: {},
    };
    const links = [kinshipLink(child.id, "birthplace", place.id)];

    const graph = buildFamilyGraph([child, place], links);

    expect(graph.parents.size).toBe(0);
    expect(graph.children.size).toBe(0);
    expect(graph.parentConflicts).toEqual([]);
  });
});

describe("hasKinshipPath", () => {
  it("finds path through spouse", () => {
    const anchor = character("a", "Anchor");
    const spouse = character("s", "Spouse");
    const graph = buildFamilyGraph(
      [anchor, spouse],
      [kinshipLink(anchor.id, "spouse", spouse.id)],
    );

    expect(hasKinshipPath(graph, anchor.id, spouse.id)).toBe(true);
  });

  it("returns false for unrelated characters", () => {
    const a = character("a", "A");
    const b = character("b", "B");
    const graph = buildFamilyGraph([a, b], []);

    expect(hasKinshipPath(graph, a.id, b.id)).toBe(false);
  });
});
