import type { WorldCard } from "@worldnote/shared";
import type { FamilyGraph } from "./buildFamilyGraph.js";
import {
  auntUncleLabel,
  childLabel,
  cousinLabel,
  grandchildLabel,
  grandparentLabel,
  halfSiblingLabel,
  inLawChildLabel,
  inLawParentLabel,
  inLawSiblingLabel,
  KINSHIP_FALLBACK,
  nieceNephewLabel,
  parentLabel,
  siblingLabel,
  spouseLabel,
  type CharacterGender,
} from "./kinshipLabels.js";

type CharacterCard = Extract<WorldCard, { card_type: "character" }>;

function isCharacter(card: WorldCard | undefined): card is CharacterCard {
  return card?.card_type === "character";
}

function genderOf(
  cardsById: Record<string, WorldCard>,
  personId: string,
): CharacterGender {
  const card = cardsById[personId];
  return isCharacter(card) ? card.gender : undefined;
}

function parentIds(graph: FamilyGraph, personId: string): string[] {
  const record = graph.parents.get(personId);
  if (!record) {
    return [];
  }
  return [record.father, record.mother].filter(
    (id): id is string => typeof id === "string",
  );
}

function ancestorDepths(
  graph: FamilyGraph,
  personId: string,
): Map<string, number> {
  const depths = new Map<string, number>([[personId, 0]]);
  const queue = [personId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    const depth = depths.get(current) ?? 0;
    for (const parentId of parentIds(graph, current)) {
      if (depths.has(parentId)) {
        continue;
      }
      depths.set(parentId, depth + 1);
      queue.push(parentId);
    }
  }

  return depths;
}

function lowestCommonAncestorDepths(
  graph: FamilyGraph,
  anchorId: string,
  personId: string,
): { up: number; down: number } | null {
  const anchorAncestors = ancestorDepths(graph, anchorId);
  const personAncestors = ancestorDepths(graph, personId);

  let best: { up: number; down: number; total: number } | null = null;

  for (const [ancestorId, up] of anchorAncestors) {
    const down = personAncestors.get(ancestorId);
    if (down === undefined) {
      continue;
    }
    const total = up + down;
    if (!best || total < best.total) {
      best = { up, down, total };
    }
  }

  if (!best) {
    return null;
  }
  return { up: best.up, down: best.down };
}

function isSpouseOf(graph: FamilyGraph, a: string, b: string): boolean {
  return graph.spouses.get(a)?.has(b) ?? false;
}

function siblingIds(graph: FamilyGraph, personId: string): Set<string> {
  const siblings = new Set<string>();
  for (const parentId of parentIds(graph, personId)) {
    const childSet = graph.children.get(parentId);
    if (!childSet) {
      continue;
    }
    for (const childId of childSet) {
      if (childId !== personId) {
        siblings.add(childId);
      }
    }
  }
  return siblings;
}

function sharedParentCount(
  graph: FamilyGraph,
  a: string,
  b: string,
): number {
  const parentsA = new Set(parentIds(graph, a));
  let count = 0;
  for (const parentId of parentIds(graph, b)) {
    if (parentsA.has(parentId)) {
      count += 1;
    }
  }
  return count;
}

function bloodKinshipLabel(
  graph: FamilyGraph,
  anchorId: string,
  personId: string,
  up: number,
  down: number,
  gender: CharacterGender,
): string | null {
  if (up === 0 && down === 0) {
    return null;
  }

  if (up === 1 && down === 0) {
    return parentLabel(gender);
  }
  if (up === 0 && down === 1) {
    return childLabel(gender);
  }
  if (up >= 2 && down === 0) {
    return grandparentLabel(gender, up);
  }
  if (up === 0 && down >= 2) {
    return grandchildLabel(gender, down);
  }
  if (up === 1 && down === 1) {
    const sharedParents = sharedParentCount(graph, anchorId, personId);
    if (sharedParents === 1) {
      return halfSiblingLabel(gender);
    }
    return siblingLabel(gender);
  }
  if (up >= 2 && down === 1) {
    return auntUncleLabel(gender, up);
  }
  if (up === 1 && down >= 2) {
    return nieceNephewLabel(gender, down);
  }
  if (up >= 2 && down >= 2) {
    return cousinLabel(gender, up, down);
  }

  return null;
}

function inLawKinshipLabel(
  graph: FamilyGraph,
  anchorId: string,
  personId: string,
  cardsById: Record<string, WorldCard>,
): string | null {
  const personGender = genderOf(cardsById, personId);

  for (const childId of graph.children.get(anchorId) ?? []) {
    if (isSpouseOf(graph, childId, personId)) {
      return inLawChildLabel(personGender);
    }
  }

  for (const siblingId of siblingIds(graph, anchorId)) {
    if (isSpouseOf(graph, siblingId, personId)) {
      return inLawSiblingLabel(personGender);
    }
  }

  for (const parentId of parentIds(graph, anchorId)) {
    if (
      isSpouseOf(graph, parentId, personId) &&
      personId !== parentId &&
      !parentIds(graph, anchorId).includes(personId)
    ) {
      return inLawParentLabel(personGender);
    }
  }

  for (const parentId of parentIds(graph, personId)) {
    if (isSpouseOf(graph, parentId, anchorId)) {
      return inLawChildLabel(genderOf(cardsById, anchorId));
    }
  }

  for (const siblingId of siblingIds(graph, personId)) {
    if (isSpouseOf(graph, siblingId, anchorId)) {
      return inLawSiblingLabel(genderOf(cardsById, anchorId));
    }
  }

  return null;
}

/** Label describing how `personId` relates to `anchorId`. */
export function resolveKinshipLabel(
  graph: FamilyGraph,
  anchorId: string,
  personId: string,
  cardsById: Record<string, WorldCard>,
): string | null {
  if (anchorId === personId) {
    return null;
  }

  if (isSpouseOf(graph, anchorId, personId)) {
    return spouseLabel(genderOf(cardsById, personId));
  }

  const lca = lowestCommonAncestorDepths(graph, anchorId, personId);
  if (lca) {
    const blood = bloodKinshipLabel(
      graph,
      anchorId,
      personId,
      lca.up,
      lca.down,
      genderOf(cardsById, personId),
    );
    if (blood) {
      return blood;
    }
  }

  const inLaw = inLawKinshipLabel(graph, anchorId, personId, cardsById);
  if (inLaw) {
    return inLaw;
  }

  return KINSHIP_FALLBACK;
}
