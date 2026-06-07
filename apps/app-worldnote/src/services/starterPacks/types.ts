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
};

export type StarterLinkDef = {
  source: string;
  sourceSocket: string;
  target: string;
  mirrorKinship?: boolean;
};

export type StarterPack = {
  id: string;
  name: string;
  description: string;
  icon: string;
  cards: StarterCardDef[];
  links: StarterLinkDef[];
};

export type StarterPackBuildResult = {
  path: string;
  name: string;
  created: boolean;
};
