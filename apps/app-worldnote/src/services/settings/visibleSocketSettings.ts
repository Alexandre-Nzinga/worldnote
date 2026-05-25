import {
  listSocketsForCardType,
  SOCKET_REGISTRY,
  type RegisteredCardType,
} from "@worldnote/shared";
import type { VisibleSocketsByCardType } from "./settings.js";

export function formatSocketId(socketId: string): string {
  return socketId.replace(/_/g, " ");
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
  for (const cardType of Object.keys(
    SOCKET_REGISTRY,
  ) as RegisteredCardType[]) {
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
