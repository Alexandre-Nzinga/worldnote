import type { NewCardType } from "../crudWorldCard/cardTemplates.js";

export type StarterCardDef = {
  key: string;
  cardType: NewCardType;
  name: string;
  position: { x: number; y: number };
  subtitle?: string;
  lore?: string;
  tags?: string[];
  customProperties?: Record<string, string | number | boolean>;
  fields?: Record<string, string | number | undefined>;
  /** When set, nested inside the group card (removed from canvas manifest). */
  groupKey?: string;
};

export type StarterLinkDef = {
  source: string;
  sourceSocket: string;
  target: string;
  mirrorKinship?: boolean;
};

export type StarterStickyNoteDef = {
  key: string;
  x: number;
  y: number;
  heading?: string;
  content: string;
  color?: string;
  width?: number;
  height?: number;
  /** Stored on the sticky note heading metadata for tutorial targeting. */
  tutorialAnchor?: string;
};

export type StarterCanvasImageDef = {
  key: string;
  x: number;
  y: number;
  /** Path under the app `public/` folder (e.g. `/starter-packs/foo.png`). */
  publicAssetPath: string;
  width?: number;
  height?: number;
};

export type StarterPack = {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Filename inside `public/starter-packs/` for the home card cover. */
  coverFile?: string;
  cards: StarterCardDef[];
  links: StarterLinkDef[];
  stickyNotes?: StarterStickyNoteDef[];
  canvasImages?: StarterCanvasImageDef[];
};

export type StarterPackBuildResult = {
  path: string;
  name: string;
  created: boolean;
  cardAnchorMap: Record<string, string>;
  stickyNoteAnchorMap: Record<string, string>;
  canvasImageAnchorMap: Record<string, string>;
};

export type BuildStarterPackOptions = {
  /** When true, always creates a fresh world (suffixes the name if taken). */
  forceNew?: boolean;
};
