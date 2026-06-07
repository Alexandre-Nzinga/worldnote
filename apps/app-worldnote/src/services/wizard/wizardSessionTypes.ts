import type { WorldCard } from "@worldnote/shared";
import type { WizardContextScope } from "./worldContext.js";

export type WizardSessionStatus = "active" | "archived";

export type StoredWizardMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
  generatedCard?: WorldCard;
  generatedCardAction?: "spawn" | "apply";
};

export type WizardSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  status: WizardSessionStatus;
  droppedCardIds: string[];
  contextScope: WizardContextScope;
  messages: StoredWizardMessage[];
};

export type WizardSessionsStore = {
  version: 1;
  activeSessionId: string | null;
  sessions: WizardSession[];
};
