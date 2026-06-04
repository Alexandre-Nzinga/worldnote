import type { CardImagePosition } from "@worldnote/shared";
import { create } from "zustand";

export type CanvasClipboardCard = {
  kind: "card";
  cardId: string;
  x: number;
  y: number;
};

export type CanvasClipboardImage = {
  kind: "image";
  imageId: string;
  x: number;
  y: number;
  imagePath: string;
  width?: number;
  height?: number;
  imagePosition?: CardImagePosition;
};

export type CanvasClipboardStickyNote = {
  kind: "stickyNote";
  noteId: string;
  x: number;
  y: number;
  heading?: string;
  color?: string;
  content?: string;
  width?: number;
  height?: number;
};

export type CanvasClipboardItem =
  | CanvasClipboardCard
  | CanvasClipboardImage
  | CanvasClipboardStickyNote;

export type CanvasClipboardPayload = {
  vaultPath: string;
  items: CanvasClipboardItem[];
};

type CanvasClipboardState = {
  vaultPath: string | null;
  items: CanvasClipboardItem[];
  pasteGeneration: number;
  setClipboard: (payload: CanvasClipboardPayload) => void;
  nextPasteGeneration: () => number;
  hasClipboard: () => boolean;
};

export const useCanvasClipboard = create<CanvasClipboardState>((set, get) => ({
  vaultPath: null,
  items: [],
  pasteGeneration: 0,
  setClipboard: ({ vaultPath, items }) => {
    set({ vaultPath, items, pasteGeneration: 0 });
  },
  nextPasteGeneration: () => {
    const next = get().pasteGeneration + 1;
    set({ pasteGeneration: next });
    return next;
  },
  hasClipboard: () => get().items.length > 0,
}));
