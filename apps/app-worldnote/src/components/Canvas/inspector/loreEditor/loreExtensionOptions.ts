import type { WorldCard } from "@worldnote/shared";

export type LoreExtensionOptions = {
  vaultPath: string;
  cardId: string;
  readOnly: boolean;
  cardsById: Record<string, WorldCard>;
  onNavigateToCard?: (cardId: string) => void;
};

export type LoreOptionsGetter = () => LoreExtensionOptions;
