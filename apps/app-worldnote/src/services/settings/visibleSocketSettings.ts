import {
  listSocketsForCardType,
  SOCKET_REGISTRY,
} from "@worldnote/shared";
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
