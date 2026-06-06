import type { Link, WorldCard } from "@worldnote/shared";

const KINSHIP_SOCKETS = new Set(["father", "mother", "issue", "spouse"]);

export type ParentRole = "father" | "mother";

export type ParentRecord = {
  father?: string;
  mother?: string;
};

/** Multiple links claim the same parent role for one child. */
export type ParentConflict = {
  childId: string;
  role: ParentRole;
  /** Parent used for family-tree graph traversal. */
  canonicalParentId: string;
  /** Other linked parents of the same role — not used for kinship labels. */
  alternateParentIds: readonly string[];
};

export type FamilyGraph = {
  characterIds: ReadonlySet<string>;
  parents: ReadonlyMap<string, ParentRecord>;
  children: ReadonlyMap<string, ReadonlySet<string>>;
  spouses: ReadonlyMap<string, ReadonlySet<string>>;
  parentConflicts: readonly ParentConflict[];
};

type ParentCandidate = {
  parentId: string;
  linkIndex: number;
  explicit: boolean;
};

type RoleCandidates = {
  father: ParentCandidate[];
  mother: ParentCandidate[];
};

function isCharacterCard(card: WorldCard): card is Extract<
  WorldCard,
  { card_type: "character" }
> {
  return card.card_type === "character";
}

function addToSetMap(
  map: Map<string, Set<string>>,
  key: string,
  value: string,
): void {
  const existing = map.get(key);
  if (existing) {
    existing.add(value);
    return;
  }
  map.set(key, new Set([value]));
}

function inferParentRole(
  genderById: Map<string, "male" | "female" | "x" | undefined>,
  parentId: string,
): ParentRole {
  const gender = genderById.get(parentId);
  if (gender === "female") {
    return "mother";
  }
  return "father";
}

function ensureRoleCandidates(
  map: Map<string, RoleCandidates>,
  childId: string,
): RoleCandidates {
  const existing = map.get(childId);
  if (existing) {
    return existing;
  }
  const record: RoleCandidates = { father: [], mother: [] };
  map.set(childId, record);
  return record;
}

function addCandidate(
  map: Map<string, RoleCandidates>,
  childId: string,
  parentId: string,
  role: ParentRole,
  linkIndex: number,
  explicit: boolean,
): void {
  if (childId === parentId) {
    return;
  }
  const record = ensureRoleCandidates(map, childId);
  record[role].push({ parentId, linkIndex, explicit });
}

/**
 * Picks one parent per role when multiple links compete.
 *
 * 1. Explicit father/mother links on the child outrank issue links from a parent.
 * 2. Within the same tier, the last matching link in the links array wins
 *    (treat array order as most-recently-added when links are appended).
 */
function pickCanonicalParent(
  candidates: ParentCandidate[],
): { canonical?: string; alternates: string[] } {
  if (candidates.length === 0) {
    return { alternates: [] };
  }

  const explicit = candidates.filter((entry) => entry.explicit);
  const pool = explicit.length > 0 ? explicit : candidates;
  const sorted = [...pool].sort((a, b) => a.linkIndex - b.linkIndex);
  const canonical = sorted[sorted.length - 1]?.parentId;
  if (!canonical) {
    return { alternates: [] };
  }

  const alternates = [
    ...new Set(
      candidates
        .map((entry) => entry.parentId)
        .filter((parentId) => parentId !== canonical),
    ),
  ];

  return { canonical, alternates };
}

function buildParentConflicts(
  candidatesByChild: Map<string, RoleCandidates>,
): ParentConflict[] {
  const conflicts: ParentConflict[] = [];

  for (const [childId, roles] of candidatesByChild) {
    for (const role of ["father", "mother"] as const) {
      const { canonical, alternates } = pickCanonicalParent(roles[role]);
      if (!canonical || alternates.length === 0) {
        continue;
      }
      conflicts.push({
        childId,
        role,
        canonicalParentId: canonical,
        alternateParentIds: alternates,
      });
    }
  }

  return conflicts;
}

/** Returns parent-role conflicts for a single character card. */
export function parentConflictsForCard(
  conflicts: readonly ParentConflict[],
  cardId: string,
): ParentConflict[] {
  return conflicts.filter((conflict) => conflict.childId === cardId);
}

/** Normalizes character kinship links into parent/child/spouse adjacency. */
export function buildFamilyGraph(
  characters: WorldCard[],
  links: Link[],
): FamilyGraph {
  const characterIds = new Set(characters.map((card) => card.id));
  const cardTypeById = new Map(
    characters.filter(isCharacterCard).map((card) => [card.id, card.card_type]),
  );
  const genderById = new Map(
    characters.filter(isCharacterCard).map((card) => [card.id, card.gender]),
  );

  const candidatesByChild = new Map<string, RoleCandidates>();
  const parents = new Map<string, ParentRecord>();
  const children = new Map<string, Set<string>>();
  const spouses = new Map<string, Set<string>>();

  for (let linkIndex = 0; linkIndex < links.length; linkIndex += 1) {
    const link = links[linkIndex];
    if (!link || !KINSHIP_SOCKETS.has(link.source_socket)) {
      continue;
    }
    if (
      !characterIds.has(link.source_card) ||
      !characterIds.has(link.target_card)
    ) {
      continue;
    }
    if (
      cardTypeById.get(link.source_card) !== "character" ||
      cardTypeById.get(link.target_card) !== "character"
    ) {
      continue;
    }

    const sourceId = link.source_card;
    const targetId = link.target_card;

    switch (link.source_socket) {
      case "mother":
        addCandidate(
          candidatesByChild,
          sourceId,
          targetId,
          "mother",
          linkIndex,
          true,
        );
        addToSetMap(children, targetId, sourceId);
        break;
      case "father":
        addCandidate(
          candidatesByChild,
          sourceId,
          targetId,
          "father",
          linkIndex,
          true,
        );
        addToSetMap(children, targetId, sourceId);
        break;
      case "issue": {
        const role = inferParentRole(genderById, sourceId);
        addCandidate(
          candidatesByChild,
          targetId,
          sourceId,
          role,
          linkIndex,
          false,
        );
        addToSetMap(children, sourceId, targetId);
        break;
      }
      case "spouse":
        addToSetMap(spouses, sourceId, targetId);
        addToSetMap(spouses, targetId, sourceId);
        break;
      default:
        break;
    }
  }

  const parentConflicts = buildParentConflicts(candidatesByChild);

  for (const [childId, roles] of candidatesByChild) {
    const record: ParentRecord = {};
    const fatherPick = pickCanonicalParent(roles.father);
    const motherPick = pickCanonicalParent(roles.mother);
    if (fatherPick.canonical) {
      record.father = fatherPick.canonical;
    }
    if (motherPick.canonical) {
      record.mother = motherPick.canonical;
    }
    if (record.father || record.mother) {
      parents.set(childId, record);
    }
  }

  return {
    characterIds,
    parents,
    children,
    spouses,
    parentConflicts,
  };
}

export function characterCardsFromRecord(
  cardsById: Record<string, WorldCard>,
): WorldCard[] {
  return Object.values(cardsById).filter(isCharacterCard);
}
