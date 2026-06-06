import type { WorldCard } from "@worldnote/shared";
import type { RelationsToAnchor } from "./computeRelationsToAnchor.js";
import {
  DEFAULT_FAMILY_TREE_UNRELATED_MODE,
  type FamilyTreeUnrelatedMode,
} from "../settings/familyTreeSettings.js";

export type FamilyTreeNodeState = {
  kinshipLabel?: string;
  hidden: boolean;
  dimmed?: boolean;
};

export function familyTreeNodeStateForCard(
  card: WorldCard,
  anchorId: string | null,
  relations: RelationsToAnchor | null,
  unrelatedMode: FamilyTreeUnrelatedMode = DEFAULT_FAMILY_TREE_UNRELATED_MODE,
): FamilyTreeNodeState | null {
  if (!anchorId || !relations || card.card_type !== "character") {
    return null;
  }

  if (card.id === anchorId) {
    return { hidden: false };
  }

  const relation = relations.get(card.id);
  if (!relation?.related) {
    if (unrelatedMode === "hide") {
      return { hidden: true };
    }
    return { hidden: false, dimmed: true };
  }

  return {
    hidden: false,
    kinshipLabel: relation.kinshipLabel,
  };
}
