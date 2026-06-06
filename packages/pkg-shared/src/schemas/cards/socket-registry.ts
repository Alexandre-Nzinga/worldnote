import type { WorldCard } from "./world-card.js";

export type SocketCardinality = "single" | "many";

export type SocketDescriptor = {
  accepts: ReadonlyArray<WorldCard["card_type"]>;
  cardinality: SocketCardinality;
};

export const SOCKET_REGISTRY = {
  character: {
    birthplace: { accepts: ["location", "building", "structure","planet", "moon", "satellite", "asteroid", "star"], cardinality: "single" },
    deathplace: { accepts: ["location", "building", "structure", "planet", "moon", "satellite", "asteroid", "star"], cardinality: "single" },
    mother: { accepts: ["character"], cardinality: "single" },
    father: { accepts: ["character"], cardinality: "single" },
    spouse: { accepts: ["character"], cardinality: "many" },
    issue: { accepts: ["character"], cardinality: "many" },
    religion: { accepts: ["religion"], cardinality: "single" },
    culture: { accepts: ["culture"], cardinality: "single" },
    languages: { accepts: ["language"], cardinality: "many" },
    spells: { accepts: ["spell"], cardinality: "many" },
    combat_styles: { accepts: ["combat_style"], cardinality: "many" },
    afflictions: { accepts: ["disease"], cardinality: "many" },
    affiliations: {
      accepts: ["organization", "polity", "group", "family"],
      cardinality: "many",
    },
  },
  location: {
    parent_location: {
      accepts: ["location", "building", "structure", "planet", "polity"],
      cardinality: "single",
    },
    planet: { accepts: ["planet"], cardinality: "single" },
    polity: { accepts: ["polity"], cardinality: "single" },
    laws: { accepts: ["law"], cardinality: "many" },
    dominant_religion: { accepts: ["religion"], cardinality: "single" },
    cultures: { accepts: ["culture"], cardinality: "many" },
    languages: { accepts: ["language"], cardinality: "many" },
  },
  item: {
    origin_place: {
      accepts: ["location", "building", "structure"],
      cardinality: "single",
    },
    creator: { accepts: ["character"], cardinality: "single" },
  },
  vehicle: {
    manufacturer: { accepts: ["character", "organization", "polity"], cardinality: "single" },
    operator: { accepts: ["organization", "polity"], cardinality: "single" },
  },
  fauna: {
    species: { accepts: ["species"], cardinality: "single" },
    habitat: { accepts: ["location", "planet", "moon", "satellite", "asteroid", "star"], cardinality: "single" },
  },
  flora: {
    habitat: { accepts: ["location", "planet", "moon", "satellite", "asteroid", "star"], cardinality: "single" },
  },
  building: {
    parent_structure: { accepts: ["structure"], cardinality: "single" },
    location: { accepts: ["location", "planet", "moon", "satellite", "asteroid", "star"], cardinality: "single" },
  },
  structure: {
    parent_location_id: { accepts: ["location"], cardinality: "single" },
  },
  species: {
    homeworld: { accepts: ["location", "planet", "moon", "satellite", "asteroid", "star"], cardinality: "single" },
  },
  planet: {
    orbits_star: { accepts: ["star"], cardinality: "single" },
    moons: { accepts: ["moon"], cardinality: "many" },
    satellites: { accepts: ["satellite"], cardinality: "many" },
    asteroids: { accepts: ["asteroid"], cardinality: "many" },
  },
  moon: {
    orbits: { accepts: ["planet"], cardinality: "single" },
    satellites: { accepts: ["satellite"], cardinality: "many" },
    asteroids: { accepts: ["asteroid"], cardinality: "many" },
    moon_of: { accepts: ["planet", "star"], cardinality: "single" },
  },
  satellite: {
    orbits: { accepts: ["planet"], cardinality: "single" },
  },
  asteroid: {
    orbits: { accepts: ["star", "planet"], cardinality: "single" },
    satellites: { accepts: ["satellite"], cardinality: "many" },
  },
  star: {
    galaxy: { accepts: ["location"], cardinality: "single" },
    star_of: { accepts: ["planet", "moon", "satellite", "asteroid"], cardinality: "single" },
    satellites: { accepts: ["satellite"], cardinality: "many" },
  },
  organization: {
    parent_organization: { accepts: ["organization"], cardinality: "single" },
    headquarters: {
      accepts: ["location", "building", "structure"],
      cardinality: "single",
    },
    polity: { accepts: ["polity"], cardinality: "single" },
  },
  polity: {
    parent_polity: { accepts: ["polity"], cardinality: "single" },
    capital: {
      accepts: ["location", "building", "structure"],
      cardinality: "single",
    },
    homeworld: { accepts: ["planet"], cardinality: "single" },
  },
  family: {
    seat: {
      accepts: ["location", "building", "structure"],
      cardinality: "single",
    },
    polity: { accepts: ["polity"], cardinality: "single" },
    members: { accepts: ["character"], cardinality: "many" },
  },
  group: {
    parent_group: { accepts: ["group"], cardinality: "single" },
    headquarters: {
      accepts: ["location", "building", "structure"],
      cardinality: "single",
    },
    members: { accepts: ["character"], cardinality: "many" },
  },
  disaster: {
    origin_location: {
      accepts: ["location", "building", "structure", "planet", "moon", "satellite", "asteroid", "star"],
      cardinality: "single",
    },
    affected_locations: { accepts: ["location", "building", "structure", "planet", "moon", "satellite", "asteroid", "star"], cardinality: "many" },
  },
  event: {
    event_location: {
      accepts: ["location", "building", "structure", "planet", "moon", "satellite", "asteroid", "star"],
      cardinality: "single",
    },
    participants: {
      accepts: ["character", "organization", "polity"],
      cardinality: "many",
    },
  },
} as const satisfies Record<string, Record<string, SocketDescriptor>>;

export type RegisteredCardType = keyof typeof SOCKET_REGISTRY;

export type SocketIdFor<T extends RegisteredCardType> =
  keyof (typeof SOCKET_REGISTRY)[T];

const socketRegistryByCardType: Record<
  string,
  Record<string, SocketDescriptor>
> = SOCKET_REGISTRY;

export function getSocketDescriptor(
  cardType: string,
  socket: string,
): SocketDescriptor | undefined {
  return socketRegistryByCardType[cardType]?.[socket];
}

export function listSocketsForCardType(
  cardType: string,
): Array<{ id: string; descriptor: SocketDescriptor }> {
  const cardSockets = socketRegistryByCardType[cardType];
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
