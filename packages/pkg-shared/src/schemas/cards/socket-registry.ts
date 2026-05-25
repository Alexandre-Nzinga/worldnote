import type { WorldCard } from "./world-card.js";

export type SocketCardinality = "single" | "many";

export type SocketDescriptor = {
  accepts: ReadonlyArray<WorldCard["card_type"]>;
  cardinality: SocketCardinality;
};

export const SOCKET_REGISTRY = {
  character: {
    birthplace: { accepts: ["location", "building", "structure"], cardinality: "single" },
    deathplace: { accepts: ["location", "building", "structure"], cardinality: "single" },
    current_location: { accepts: ["location", "building", "structure"], cardinality: "single" },
    mother: { accepts: ["character"], cardinality: "single" },
    father: { accepts: ["character"], cardinality: "single" },
    spouse: { accepts: ["character"], cardinality: "single" },
    issue: { accepts: ["character"], cardinality: "many" },
  },
  location: {
    parent_location: { accepts: ["location", "building", "structure"], cardinality: "single" },
  },
  item: {
    origin_place: {
      accepts: ["location", "building", "structure"],
      cardinality: "single",
    },
    creator_id: { accepts: ["character"], cardinality: "single" },
  },
  vehicle: {
    // TODO: add organization, polity when those card types exist
    manufacturer_id: { accepts: ["character"], cardinality: "single" },
    current_hangar_id: {
      accepts: ["building", "structure"],
      cardinality: "single",
    },
  },
  fauna: {
    species: { accepts: ["species"], cardinality: "single" },
    native_habitat_id: { accepts: ["location"], cardinality: "single" },
  },
  flora: {
    native_habitat_id: { accepts: ["location"], cardinality: "single" },
  },
  building: {
    // TODO: architectural_style → culture bond when culture card type exists
    parent_structure_id: { accepts: ["structure"], cardinality: "single" },
  },
  structure: {
    parent_location_id: { accepts: ["location"], cardinality: "single" },
  },
  species: {
    homeworld: { accepts: ["location"], cardinality: "single" },
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
