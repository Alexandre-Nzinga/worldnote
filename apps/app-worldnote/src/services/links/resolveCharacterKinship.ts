import {
  getSocketDescriptor,
  listSocketsForCardType,
  type Link,
  type WorldCard,
} from "@worldnote/shared";

const PARENT_SOCKETS = ["father", "mother"] as const;
const KINSHIP_SOCKETS = ["issue", "father", "mother", "spouse"] as const;

export type CharacterCard = Extract<WorldCard, { card_type: "character" }>;

function isCharacter(card: WorldCard): card is CharacterCard {
  return card.card_type === "character";
}

function parentSocketForGender(
  gender: CharacterCard["gender"] | undefined,
): "father" | "mother" {
  if (gender === "female") {
    return "mother";
  }
  return "father";
}

function linkExists(
  links: Link[],
  sourceCardId: string,
  socketId: string,
  targetCardId: string,
): boolean {
  return links.some(
    (l) =>
      l.source_card === sourceCardId &&
      l.source_socket === socketId &&
      l.target_card === targetCardId,
  );
}

function ownerListsPluggedAsParent(
  owner: CharacterCard,
  plugged: CharacterCard,
  links: Link[],
): boolean {
  return PARENT_SOCKETS.some((socket) =>
    linkExists(links, owner.id, socket, plugged.id),
  );
}

function pluggedListsOwnerAsParent(
  owner: CharacterCard,
  plugged: CharacterCard,
  links: Link[],
): boolean {
  return PARENT_SOCKETS.some((socket) =>
    linkExists(links, plugged.id, socket, owner.id),
  );
}

function countIssueChildren(cardId: string, links: Link[]): number {
  return links.filter(
    (l) => l.source_card === cardId && l.source_socket === "issue",
  ).length;
}

function isParentSocketTaken(owner: CharacterCard, links: Link[]): boolean {
  return PARENT_SOCKETS.some((socket) =>
    links.some((l) => l.source_card === owner.id && l.source_socket === socket),
  );
}

function isSocketAvailable(
  owner: CharacterCard,
  socketId: string,
  links: Link[],
): boolean {
  const descriptor = getSocketDescriptor(owner.card_type, socketId);
  if (!descriptor) {
    return false;
  }
  if (descriptor.cardinality === "many") {
    return true;
  }
  return !links.some(
    (l) => l.source_card === owner.id && l.source_socket === socketId,
  );
}

/**
 * Pick the character socket on `owner` when `plugged` is dragged from its entity handle
 * onto `owner`'s card (card-body drop).
 *
 * Genealogy model: father/mother on the child card point to the parent; issue on the
 * parent card lists children.
 */
export function resolveCharacterKinshipSocket(
  owner: CharacterCard,
  plugged: CharacterCard,
  links: Link[],
): string | null {
  const entries = listSocketsForCardType("character").filter((entry) =>
    entry.descriptor.accepts.includes("character"),
  );
  const available = (socketId: string) =>
    entries.some((e) => e.id === socketId) &&
    isSocketAvailable(owner, socketId, links);

  if (ownerListsPluggedAsParent(owner, plugged, links)) {
    return available("issue") ? "issue" : null;
  }

  if (pluggedListsOwnerAsParent(owner, plugged, links)) {
    return available("issue") ? "issue" : null;
  }

  const ownerIssueCount = countIssueChildren(owner.id, links);
  const pluggedIssueCount = countIssueChildren(plugged.id, links);
  const ownerParentTaken = isParentSocketTaken(owner, links);

  if (ownerIssueCount > 0) {
    return available("issue") ? "issue" : null;
  }

  if (!ownerParentTaken && pluggedIssueCount > 0) {
    const parentSocket = parentSocketForGender(plugged.gender);
    if (available(parentSocket)) {
      return parentSocket;
    }
  }

  // Card-body drop: treat plugged as child of owner (issue on parent). To set
  // someone as father/mother, drag onto the child's father/mother socket handle.
  if (available("issue")) {
    return "issue";
  }

  if (!ownerParentTaken) {
    const parentSocket = parentSocketForGender(plugged.gender);
    if (available(parentSocket)) {
      return parentSocket;
    }
  }

  for (const socketId of KINSHIP_SOCKETS) {
    if (available(socketId)) {
      return socketId;
    }
  }

  return null;
}

/** Inverse socket when creating a kinship link so both cards stay consistent. */
export function reciprocalKinshipLink(
  sourceCard: CharacterCard,
  sourceSocket: string,
  targetCard: CharacterCard,
): { sourceCard: CharacterCard; sourceSocket: string; targetCard: CharacterCard } | null {
  if (sourceSocket === "father" || sourceSocket === "mother") {
    return {
      sourceCard: targetCard,
      sourceSocket: "issue",
      targetCard: sourceCard,
    };
  }
  if (sourceSocket === "issue") {
    return {
      sourceCard: targetCard,
      sourceSocket: parentSocketForGender(sourceCard.gender),
      targetCard: sourceCard,
    };
  }
  return null;
}

export function findTargetSocketForPluggedCard(
  owner: WorldCard,
  plugged: WorldCard,
  links: Link[],
): string | null {
  if (isCharacter(owner) && isCharacter(plugged)) {
    const kinship = resolveCharacterKinshipSocket(owner, plugged, links);
    if (kinship) {
      return kinship;
    }
  }

  for (const { id, descriptor } of listSocketsForCardType(owner.card_type)) {
    if (!descriptor.accepts.includes(plugged.card_type)) {
      continue;
    }
    if (descriptor.cardinality === "single") {
      const occupied = links.some(
        (l) => l.source_card === owner.id && l.source_socket === id,
      );
      if (!occupied) {
        return id;
      }
      continue;
    }
    return id;
  }

  return null;
}
