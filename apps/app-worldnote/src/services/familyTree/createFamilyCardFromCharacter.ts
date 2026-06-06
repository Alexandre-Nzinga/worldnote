import {
  FamilyCardSchema,
  type FamilyCard,
  type WorldCard,
} from "@worldnote/shared";
import { createWorldCard } from "../crudWorldCard/createWorldCard.js";
import { updateWorldCard } from "../crudWorldCard/updateWorldCard.js";
import type { FamilyGraph } from "./buildFamilyGraph.js";
import {
  defaultFamilyCardName,
  findFamilyCardByAnchor,
} from "./familyCardAnchor.js";
import { syncFamilyCardMembers } from "./syncFamilyCardMembers.js";
import type { Link } from "@worldnote/shared";

type Position = { x: number; y: number };

const FAMILY_CARD_SPAWN_OFFSET = { x: 320, y: -80 } as const;

type CreateFamilyCardFromCharacterInput = {
  vault: string;
  anchorCharacter: Extract<WorldCard, { card_type: "character" }>;
  graph: FamilyGraph;
  links: readonly Link[];
  cardsById: Record<string, WorldCard>;
  position?: Position;
  extraAnchorIds?: readonly string[];
};

export type CreateFamilyCardFromCharacterResult = {
  familyCard: FamilyCard;
  links: Link[];
  created: boolean;
};

function familySpawnPosition(anchorPosition: Position): Position {
  return {
    x: anchorPosition.x + FAMILY_CARD_SPAWN_OFFSET.x,
    y: anchorPosition.y + FAMILY_CARD_SPAWN_OFFSET.y,
  };
}

/** Creates or reuses a family card rooted at a character and syncs member links. */
export async function createFamilyCardFromCharacter({
  vault,
  anchorCharacter,
  graph,
  links,
  cardsById,
  position,
  extraAnchorIds = [],
}: CreateFamilyCardFromCharacterInput): Promise<CreateFamilyCardFromCharacterResult> {
  const existing = findFamilyCardByAnchor(cardsById, anchorCharacter.id);
  if (existing) {
    const sync = await syncFamilyCardMembers({
      vault,
      familyCard: existing,
      graph,
      links,
      cardsById,
      extraAnchorIds,
    });
    return {
      familyCard: existing,
      links: sync.links,
      created: false,
    };
  }

  const spawnPosition = position ?? familySpawnPosition(anchorCharacter.position);
  const draft = await createWorldCard({
    vault,
    cardType: "family",
    position: spawnPosition,
    name: defaultFamilyCardName(anchorCharacter.name),
  });

  const familyCard = FamilyCardSchema.parse(
    await updateWorldCard(vault, {
      ...draft,
      card_type: "family",
      anchor_character_id: anchorCharacter.id,
    }),
  );

  const nextCardsById = { ...cardsById, [familyCard.id]: familyCard };
  const sync = await syncFamilyCardMembers({
    vault,
    familyCard,
    graph,
    links,
    cardsById: nextCardsById,
    extraAnchorIds,
  });

  return {
    familyCard,
    links: sync.links,
    created: true,
  };
}
