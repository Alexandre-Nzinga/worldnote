import { isEntityHandle, canonicalSocketId } from "@worldnote/canvas";
import type { Connection, Edge } from "@xyflow/react";
import {
  getSocketDescriptor,
  type Link,
  type WorldCard,
} from "@worldnote/shared";
import { findTargetSocketForPluggedCard } from "./resolveCharacterKinship.js";

export type ConnectDragOrigin =
  | { kind: "socket"; ownerCardId: string; socketId: string }
  | { kind: "entity"; cardId: string };

export type ResolveEasyConnectOptions = {
  links?: Link[];
};

/** React Flow edge: plugged-in card is source (entity), socket owner is target. */
export function resolveEasyConnect(
  origin: ConnectDragOrigin,
  dropCardId: string,
  cardsById: Record<string, WorldCard>,
  options: ResolveEasyConnectOptions = {},
): Connection | null {
  const links = options.links ?? [];
  const dropCard = cardsById[dropCardId];
  if (!dropCard) {
    return null;
  }

  if (origin.kind === "socket") {
    const owner = cardsById[origin.ownerCardId];
    if (!owner || owner.id === dropCard.id) {
      return null;
    }
    const descriptor = getSocketDescriptor(owner.card_type, origin.socketId);
    if (!descriptor?.accepts.includes(dropCard.card_type)) {
      return null;
    }
    return {
      source: dropCard.id,
      target: owner.id,
      sourceHandle: "entity",
      targetHandle: origin.socketId,
    };
  }

  const plugged = cardsById[origin.cardId];
  if (!plugged || plugged.id === dropCard.id) {
    return null;
  }

  const targetSocket = findTargetSocketForPluggedCard(dropCard, plugged, links);
  if (!targetSocket) {
    return null;
  }

  return {
    source: plugged.id,
    target: dropCard.id,
    sourceHandle: "entity",
    targetHandle: targetSocket,
  };
}

export function canEasyConnect(
  origin: ConnectDragOrigin,
  dropCardId: string,
  cardsById: Record<string, WorldCard>,
  options: ResolveEasyConnectOptions = {},
): boolean {
  return resolveEasyConnect(origin, dropCardId, cardsById, options) !== null;
}

/** Infer drag origin from a connect-start handle. */
export function connectOriginFromHandle(
  nodeId: string,
  handleId: string,
  handleType: "source" | "target" | null,
): ConnectDragOrigin | null {
  if (handleType === "target") {
    const socketId = canonicalSocketId(handleId);
    if (!socketId) {
      return null;
    }
    return { kind: "socket", ownerCardId: nodeId, socketId };
  }
  if (handleType === "source" && isEntityHandle(handleId)) {
    return { kind: "entity", cardId: nodeId };
  }
  return null;
}

/** Fill in entity + target socket when the drop target is the whole card. */
export function normalizeConnection(
  connection: Connection,
  cardsById: Record<string, WorldCard>,
  links: Link[] = [],
): Connection | null {
  if (!connection.source || !connection.target) {
    return null;
  }

  const targetHandle = connection.targetHandle
    ? canonicalSocketId(connection.targetHandle)
    : null;
  const sourceHandle = connection.sourceHandle ?? "entity";

  if (targetHandle) {
    if (!isEntityHandle(sourceHandle)) {
      return null;
    }
    return {
      source: connection.source,
      target: connection.target,
      sourceHandle: "entity",
      targetHandle,
    };
  }

  if (!isEntityHandle(sourceHandle)) {
    return null;
  }

  const plugged = cardsById[connection.source];
  const owner = cardsById[connection.target];
  if (!plugged || !owner || plugged.id === owner.id) {
    return null;
  }

  const socket = findTargetSocketForPluggedCard(owner, plugged, links);
  if (!socket) {
    return null;
  }

  return {
    source: plugged.id,
    target: owner.id,
    sourceHandle: "entity",
    targetHandle: socket,
  };
}

export function isValidEasyConnection(
  connection: Connection | Edge,
  cardsById: Record<string, WorldCard>,
  links: Link[] = [],
): boolean {
  if (!connection.source || !connection.target) {
    return false;
  }

  const targetHandle =
    "targetHandle" in connection ? connection.targetHandle : undefined;
  const sourceHandle =
    "sourceHandle" in connection ? connection.sourceHandle : undefined;

  if (targetHandle) {
    const socketId = canonicalSocketId(targetHandle);
    if (!socketId) {
      return false;
    }
    if (sourceHandle && !isEntityHandle(sourceHandle)) {
      return false;
    }
    const owner = cardsById[connection.target];
    const plugged = cardsById[connection.source];
    if (!owner || !plugged) {
      return false;
    }
    const descriptor = getSocketDescriptor(owner.card_type, socketId);
    return descriptor?.accepts.includes(plugged.card_type) ?? false;
  }

  if (!isEntityHandle(sourceHandle)) {
    return false;
  }

  const plugged = cardsById[connection.source];
  const owner = cardsById[connection.target];
  if (!plugged || !owner || plugged.id === owner.id) {
    return false;
  }

  return findTargetSocketForPluggedCard(owner, plugged, links) !== null;
}
