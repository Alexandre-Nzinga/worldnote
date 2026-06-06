import type { FamilyGraph } from "./buildFamilyGraph.js";

function kinshipNeighborIds(graph: FamilyGraph, personId: string): string[] {
  const neighbors: string[] = [];

  const parentRecord = graph.parents.get(personId);
  if (parentRecord?.father) {
    neighbors.push(parentRecord.father);
  }
  if (parentRecord?.mother) {
    neighbors.push(parentRecord.mother);
  }

  const childSet = graph.children.get(personId);
  if (childSet) {
    neighbors.push(...childSet);
  }

  const spouseSet = graph.spouses.get(personId);
  if (spouseSet) {
    neighbors.push(...spouseSet);
  }

  return neighbors;
}

/** All characters connected to any anchor via parent/child/spouse links. */
export function collectKinshipMembers(
  graph: FamilyGraph,
  anchorIds: readonly string[],
): string[] {
  const members = new Set<string>();
  const queue: string[] = [];

  for (const anchorId of anchorIds) {
    if (!graph.characterIds.has(anchorId)) {
      continue;
    }
    if (!members.has(anchorId)) {
      members.add(anchorId);
      queue.push(anchorId);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    for (const next of kinshipNeighborIds(graph, current)) {
      if (members.has(next)) {
        continue;
      }
      members.add(next);
      queue.push(next);
    }
  }

  return [...members];
}
