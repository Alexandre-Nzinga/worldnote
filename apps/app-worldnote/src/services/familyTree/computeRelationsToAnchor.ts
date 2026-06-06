import type { WorldCard } from "@worldnote/shared";
import type { FamilyGraph } from "./buildFamilyGraph.js";
import { hasKinshipPath } from "./hasKinshipPath.js";
import { resolveKinshipLabel } from "./resolveKinshipLabel.js";

export type AnchorRelation = {
  kinshipLabel: string;
  related: boolean;
};

export type RelationsToAnchor = ReadonlyMap<string, AnchorRelation>;

/** Maps every character id to its relation label relative to the anchor. */
export function computeRelationsToAnchor(
  graph: FamilyGraph,
  anchorId: string,
  cardsById: Record<string, WorldCard>,
): RelationsToAnchor {
  const result = new Map<string, AnchorRelation>();

  for (const characterId of graph.characterIds) {
    if (characterId === anchorId) {
      continue;
    }

    const related = hasKinshipPath(graph, anchorId, characterId);
    if (!related) {
      result.set(characterId, { related: false, kinshipLabel: "" });
      continue;
    }

    const kinshipLabel =
      resolveKinshipLabel(graph, anchorId, characterId, cardsById) ?? "Relative";

    result.set(characterId, { related: true, kinshipLabel });
  }

  return result;
}
