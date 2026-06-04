import type { CanvasImagePlacement } from "@worldnote/canvas";
import type { CanvasFlowNode, ImageFlowNode } from "@worldnote/canvas";
import type { WorldCard } from "@worldnote/shared";
import { create } from "zustand";
import { deleteWorldCard } from "../crudWorldCard/deleteWorldCard.js";
import { updateWorldCard } from "../crudWorldCard/updateWorldCard.js";
import { invoke } from "@tauri-apps/api/core";
import type { Link } from "@worldnote/shared";
import { deleteLink } from "../links/deleteLink.js";
import {
  updateCanvasManifestImage,
  updateCanvasManifestNode,
} from "./canvasManifest.js";
import { deleteCanvasImage } from "../desktop/saveCanvasImage.js";

const MAX_HISTORY_ENTRIES = 50;

export type CanvasHistorySnapshot = {
  vaultPath: string;
  cards: WorldCard[];
  links: Link[];
  images: CanvasImagePlacement[];
};

export function captureCanvasHistorySnapshot(
  vaultPath: string,
  nodes: CanvasFlowNode[],
  cardsById: Record<string, WorldCard>,
  linksById: Record<string, Link>,
): CanvasHistorySnapshot {
  const cards = Object.values(cardsById).map((card) => {
    const node = nodes.find(
      (entry) => entry.id === card.id && entry.type === "worldnoteCard",
    );
    return node ? { ...card, position: node.position } : card;
  });

  const images = nodes
    .filter((node): node is ImageFlowNode => node.type === "worldnoteImage")
    .flatMap((node) => {
      const imagePath = node.data.imagePath;
      if (!imagePath) {
        return [];
      }
      const width = node.style?.width;
      const height = node.style?.height;
      return [
        {
          id: node.id,
          x: node.position.x,
          y: node.position.y,
          imagePath,
          width: typeof width === "number" ? width : undefined,
          height: typeof height === "number" ? height : undefined,
          imagePosition: node.data.imagePosition,
        },
      ];
    });

  return {
    vaultPath,
    cards,
    links: Object.values(linksById),
    images,
  };
}

type CanvasHistoryStore = {
  past: CanvasHistorySnapshot[];
  future: CanvasHistorySnapshot[];
  push: (snapshot: CanvasHistorySnapshot) => void;
  undo: (
    current: CanvasHistorySnapshot,
  ) => CanvasHistorySnapshot | null;
  redo: (
    current: CanvasHistorySnapshot,
  ) => CanvasHistorySnapshot | null;
  reset: () => void;
};

export const useCanvasHistoryStore = create<CanvasHistoryStore>((set, get) => ({
  past: [],
  future: [],
  push: (snapshot) => {
    set((state) => ({
      past: [...state.past.slice(-(MAX_HISTORY_ENTRIES - 1)), snapshot],
      future: [],
    }));
  },
  undo: (current) => {
    const { past } = get();
    if (past.length === 0) {
      return null;
    }
    const previous = past.at(-1);
    if (!previous) {
      return null;
    }
    set({
      past: past.slice(0, -1),
      future: [current, ...get().future],
    });
    return previous;
  },
  redo: (current) => {
    const { future } = get();
    if (future.length === 0) {
      return null;
    }
    const next = future[0];
    if (!next) {
      return null;
    }
    set({
      past: [...get().past, current],
      future: future.slice(1),
    });
    return next;
  },
  reset: () => set({ past: [], future: [] }),
}));

export async function restoreCanvasHistorySnapshot(
  snapshot: CanvasHistorySnapshot,
  currentCardsById: Record<string, WorldCard>,
  currentLinksById: Record<string, Link>,
  currentImageIds: string[],
): Promise<void> {
  const vault = snapshot.vaultPath;
  const snapshotCardIds = new Set(snapshot.cards.map((card) => card.id));
  const snapshotLinkIds = new Set(snapshot.links.map((link) => link.id));
  const snapshotImageIds = new Set(snapshot.images.map((image) => image.id));

  for (const cardId of Object.keys(currentCardsById)) {
    if (!snapshotCardIds.has(cardId)) {
      await deleteWorldCard(vault, cardId);
    }
  }

  for (const card of snapshot.cards) {
    await updateWorldCard(vault, card);
    await updateCanvasManifestNode(vault, {
      cardId: card.id,
      x: card.position.x,
      y: card.position.y,
    });
  }

  for (const linkId of Object.keys(currentLinksById)) {
    if (!snapshotLinkIds.has(linkId)) {
      await deleteLink(vault, linkId);
    }
  }

  for (const link of snapshot.links) {
    await invoke<void>("upsert_link", { vault, link });
  }

  for (const imageId of currentImageIds) {
    if (!snapshotImageIds.has(imageId)) {
      await deleteCanvasImage(vault, imageId);
    }
  }

  for (const image of snapshot.images) {
    await updateCanvasManifestImage(vault, image);
  }
}
