import type { FamilyGraph } from "./buildFamilyGraph.js";

function neighborIds(graph: FamilyGraph, personId: string): string[] {
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

/** Whether two characters are connected via parent/child or spouse links. */
export function hasKinshipPath(
  graph: FamilyGraph,
  fromId: string,
  toId: string,
): boolean {
  if (fromId === toId) {
    return true;
  }
  if (!graph.characterIds.has(fromId) || !graph.characterIds.has(toId)) {
    return false;
  }

  const queue = [fromId];
  const visited = new Set<string>([fromId]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    for (const next of neighborIds(graph, current)) {
      if (next === toId) {
        return true;
      }
      if (visited.has(next)) {
        continue;
      }
      visited.add(next);
      queue.push(next);
    }
  }

  return false;
}
