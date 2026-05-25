import type { WorldCard } from "./world-card.js";

export type SocketCardinality = "single" | "many";

export type SocketDescriptor = {
  accepts: ReadonlyArray<WorldCard["card_type"]>;
  cardinality: SocketCardinality;
};

export const SOCKET_REGISTRY = {
  character: {
    birthplace: { accepts: ["location"], cardinality: "single" },
    deathplace: { accepts: ["location"], cardinality: "single" },
    current_location: { accepts: ["location"], cardinality: "single" },
    mother: { accepts: ["character"], cardinality: "single" },
    father: { accepts: ["character"], cardinality: "single" },
    spouse: { accepts: ["character"], cardinality: "single" },
    issue: { accepts: ["character"], cardinality: "many" },
  },
  location: {
    parent_location: { accepts: ["location"], cardinality: "single" },
  },
} as const satisfies Record<string, Record<string, SocketDescriptor>>;

export type RegisteredCardType = keyof typeof SOCKET_REGISTRY;

export type SocketIdFor<T extends RegisteredCardType> =
  keyof (typeof SOCKET_REGISTRY)[T];

export function getSocketDescriptor(
  cardType: string,
  socket: string,
): SocketDescriptor | undefined {
  const cardSockets = SOCKET_REGISTRY[cardType as RegisteredCardType];
  if (!cardSockets) {
    return undefined;
  }
  return cardSockets[socket as SocketIdFor<RegisteredCardType>];
}

export function listSocketsForCardType(
  cardType: string,
): Array<{ id: string; descriptor: SocketDescriptor }> {
  const cardSockets = SOCKET_REGISTRY[cardType as RegisteredCardType];
  if (!cardSockets) {
    return [];
  }
  return Object.entries(cardSockets).map(([id, descriptor]) => ({
    id,
    descriptor,
  }));
}

export function isSocketVisible(
  visibleSockets: Record<string, boolean> | undefined,
  socketId: string,
  defaultVisible = false,
): boolean {
  if (visibleSockets && socketId in visibleSockets) {
    return visibleSockets[socketId] ?? defaultVisible;
  }
  return defaultVisible;
}
