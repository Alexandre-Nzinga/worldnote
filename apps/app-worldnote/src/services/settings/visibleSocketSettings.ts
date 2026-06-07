import { listSocketsForCardType, SOCKET_REGISTRY } from "@worldnote/shared";
import type { VisibleSocketsByCardType } from "./settings.js";
import { objectKeys } from "../objectKeys.js";

export function formatSocketId(socketId: string): string {
  const label = socketId.replace(/_/g, " ");
  if (!label) {
    return label;
  }
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getVisibleSocketsForCardType(
  settings: VisibleSocketsByCardType | undefined,
  cardType: string,
): Record<string, boolean> {
  return settings?.[cardType] ?? {};
}

export function isSocketVisibleInSettings(
  settings: VisibleSocketsByCardType | undefined,
  cardType: string,
  socketId: string,
  defaultVisible = false,
): boolean {
  const cardSettings = settings?.[cardType];
  if (cardSettings && socketId in cardSettings) {
    return cardSettings[socketId] ?? defaultVisible;
  }
  return defaultVisible;
}

/** Ensures every registered socket has an explicit boolean in settings. */
export function normalizeVisibleSocketsSettings(
  partial: VisibleSocketsByCardType | undefined,
): VisibleSocketsByCardType {
  const result: VisibleSocketsByCardType = {};
  for (const cardType of objectKeys(SOCKET_REGISTRY)) {
    const sockets = listSocketsForCardType(cardType);
    const existing = partial?.[cardType] ?? {};
    result[cardType] = {};
    for (const { id } of sockets) {
      result[cardType][id] = existing[id] ?? false;
    }
  }
  return result;
}

export function toggleSocketVisibility(
  settings: VisibleSocketsByCardType,
  cardType: string,
  socketId: string,
): VisibleSocketsByCardType {
  const cardSettings = { ...(settings[cardType] ?? {}) };
  cardSettings[socketId] = !(cardSettings[socketId] ?? false);
  return {
    ...settings,
    [cardType]: cardSettings,
  };
}

/** Character kinship sockets required by the Family Tree module. */
export const FAMILY_TREE_KINSHIP_SOCKETS = [
  "mother",
  "father",
  "spouse",
  "issue",
] as const;

/** Turns on character kinship sockets when Family Tree is enabled. */
export function applyFamilyTreeKinshipSocketVisibility(
  settings: VisibleSocketsByCardType | undefined,
  familyTreeEnabled: boolean,
): VisibleSocketsByCardType {
  const normalized = normalizeVisibleSocketsSettings(settings);
  if (!familyTreeEnabled) {
    return normalized;
  }

  const character = { ...normalized.character };
  for (const socketId of FAMILY_TREE_KINSHIP_SOCKETS) {
    character[socketId] = true;
  }

  const family = { ...(normalized.family ?? {}) };
  family.members = true;

  return { ...normalized, character, family };
}

export function enableFamilyTreeKinshipSockets(
  settings: VisibleSocketsByCardType,
): VisibleSocketsByCardType {
  return applyFamilyTreeKinshipSocketVisibility(settings, true);
}
