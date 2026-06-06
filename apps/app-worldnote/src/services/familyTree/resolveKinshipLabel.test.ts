import { describe, expect, it } from "vitest";
import type { Link, WorldCard } from "@worldnote/shared";
import { buildFamilyGraph } from "./buildFamilyGraph.js";
import { computeRelationsToAnchor } from "./computeRelationsToAnchor.js";
import { resolveKinshipLabel } from "./resolveKinshipLabel.js";

function character(
  id: string,
  name: string,
  gender?: "male" | "female" | "x",
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

function cardsById(...cards: WorldCard[]): Record<string, WorldCard> {
  return Object.fromEntries(cards.map((card) => [card.id, card]));
}

describe("resolveKinshipLabel", () => {
  it("labels mother and son", () => {
    const mother = character("m", "Elena", "female");
    const child = character("c", "Paul", "male");
    const graph = buildFamilyGraph(
      [mother, child],
      [kinshipLink(child.id, "mother", mother.id)],
    );
    const byId = cardsById(mother, child);

    expect(resolveKinshipLabel(graph, child.id, mother.id, byId)).toBe("Mother");
    expect(resolveKinshipLabel(graph, mother.id, child.id, byId)).toBe("Son");
  });

  it("labels grandfather and granddaughter", () => {
    const grandpa = character("g", "Leto", "male");
    const parent = character("p", "Paul", "male");
    const child = character("c", "Ghanima", "female");
    const links = [
      kinshipLink(parent.id, "father", grandpa.id),
      kinshipLink(child.id, "father", parent.id),
    ];
    const graph = buildFamilyGraph([grandpa, parent, child], links);
    const byId = cardsById(grandpa, parent, child);

    expect(resolveKinshipLabel(graph, child.id, grandpa.id, byId)).toBe(
      "Grandfather",
    );
    expect(resolveKinshipLabel(graph, grandpa.id, child.id, byId)).toBe(
      "Granddaughter",
    );
  });

  it("labels aunt and niece", () => {
    const grandparent = character("gp", "Grand", "male");
    const parent = character("p", "Parent", "female");
    const aunt = character("a", "Aunt", "female");
    const child = character("c", "Child", "female");
    const links = [
      kinshipLink(parent.id, "father", grandparent.id),
      kinshipLink(aunt.id, "father", grandparent.id),
      kinshipLink(child.id, "mother", parent.id),
    ];
    const graph = buildFamilyGraph([grandparent, parent, aunt, child], links);
    const byId = cardsById(grandparent, parent, aunt, child);

    expect(resolveKinshipLabel(graph, child.id, aunt.id, byId)).toBe("Aunt");
    expect(resolveKinshipLabel(graph, aunt.id, child.id, byId)).toBe("Niece");
  });

  it("labels first cousin", () => {
    const grandparent = character("gp", "Grand", "male");
    const parentA = character("pa", "Parent A", "male");
    const parentB = character("pb", "Parent B", "female");
    const cousinA = character("ca", "Cousin A", "male");
    const cousinB = character("cb", "Cousin B", "female");
    const links = [
      kinshipLink(parentA.id, "father", grandparent.id),
      kinshipLink(parentB.id, "father", grandparent.id),
      kinshipLink(cousinA.id, "father", parentA.id),
      kinshipLink(cousinB.id, "mother", parentB.id),
    ];
    const graph = buildFamilyGraph(
      [grandparent, parentA, parentB, cousinA, cousinB],
      links,
    );
    const byId = cardsById(grandparent, parentA, parentB, cousinA, cousinB);

    expect(resolveKinshipLabel(graph, cousinA.id, cousinB.id, byId)).toBe(
      "1st Cousin",
    );
  });

  it("labels second cousin and once removed", () => {
    const greatGrand = character("gg", "Great-grand", "male");
    const grandA = character("ga", "Grand A", "male");
    const grandB = character("gb", "Grand B", "female");
    const parentA = character("pa", "Parent A", "male");
    const parentB = character("pb", "Parent B", "female");
    const cousinA = character("ca", "Cousin A", "male");
    const cousinB = character("cb", "Cousin B", "female");
    const links = [
      kinshipLink(grandA.id, "father", greatGrand.id),
      kinshipLink(grandB.id, "father", greatGrand.id),
      kinshipLink(parentA.id, "father", grandA.id),
      kinshipLink(parentB.id, "father", grandB.id),
      kinshipLink(cousinA.id, "father", parentA.id),
      kinshipLink(cousinB.id, "mother", parentB.id),
    ];
    const graph = buildFamilyGraph(
      [greatGrand, grandA, grandB, parentA, parentB, cousinA, cousinB],
      links,
    );
    const byId = cardsById(
      greatGrand,
      grandA,
      grandB,
      parentA,
      parentB,
      cousinA,
      cousinB,
    );

    expect(resolveKinshipLabel(graph, cousinA.id, cousinB.id, byId)).toBe(
      "2nd Cousin",
    );
    expect(resolveKinshipLabel(graph, parentA.id, cousinB.id, byId)).toBe(
      "1st Cousin once removed",
    );
  });

  it("labels half-siblings distinctly from full siblings", () => {
    const father = character("f", "Father", "male");
    const motherA = character("ma", "Mother A", "female");
    const motherB = character("mb", "Mother B", "female");
    const fullSibling = character("fs", "Full", "female");
    const halfSibling = character("hs", "Half", "male");
    const links = [
      kinshipLink(fullSibling.id, "father", father.id),
      kinshipLink(fullSibling.id, "mother", motherA.id),
      kinshipLink(halfSibling.id, "father", father.id),
      kinshipLink(halfSibling.id, "mother", motherB.id),
    ];
    const graph = buildFamilyGraph(
      [father, motherA, motherB, fullSibling, halfSibling],
      links,
    );
    const byId = cardsById(father, motherA, motherB, fullSibling, halfSibling);

    expect(resolveKinshipLabel(graph, fullSibling.id, halfSibling.id, byId)).toBe(
      "Half-brother",
    );
    expect(resolveKinshipLabel(graph, halfSibling.id, fullSibling.id, byId)).toBe(
      "Half-sister",
    );
  });

  it("labels spouse and son-in-law", () => {
    const anchor = character("a", "Anchor", "female");
    const spouse = character("s", "Spouse", "male");
    const child = character("c", "Child", "female");
    const inLaw = character("il", "In-law", "male");
    const links = [
      kinshipLink(anchor.id, "spouse", spouse.id),
      kinshipLink(anchor.id, "issue", child.id),
      kinshipLink(child.id, "spouse", inLaw.id),
    ];
    const graph = buildFamilyGraph([anchor, spouse, child, inLaw], links);
    const byId = cardsById(anchor, spouse, child, inLaw);

    expect(resolveKinshipLabel(graph, anchor.id, spouse.id, byId)).toBe(
      "Husband",
    );
    expect(resolveKinshipLabel(graph, anchor.id, inLaw.id, byId)).toBe(
      "Son-in-law",
    );
  });

  it("uses neutral labels when gender is unknown", () => {
    const parent = character("p", "Parent");
    const child = character("c", "Child");
    const graph = buildFamilyGraph(
      [parent, child],
      [kinshipLink(child.id, "father", parent.id)],
    );
    const byId = cardsById(parent, child);

    expect(resolveKinshipLabel(graph, child.id, parent.id, byId)).toBe("Parent");
    expect(resolveKinshipLabel(graph, parent.id, child.id, byId)).toBe("Child");
  });
});

describe("computeRelationsToAnchor", () => {
  it("marks unrelated characters as not related", () => {
    const anchor = character("a", "Anchor");
    const stranger = character("s", "Stranger");
    const graph = buildFamilyGraph([anchor, stranger], []);
    const byId = cardsById(anchor, stranger);

    const relations = computeRelationsToAnchor(graph, anchor.id, byId);

    expect(relations.get(stranger.id)).toEqual({
      related: false,
      kinshipLabel: "",
    });
  });
});
