import { create } from "zustand";
import {
  TUTORIAL_STEPS,
  type TutorialAwaitEvent,
  type TutorialStep,
} from "../components/Tutorial/tutorialSteps.js";

export type TutorialEntryPoint = "home" | "settings";

type TutorialAnchorMaps = {
  cardAnchorMap: Record<string, string>;
  stickyNoteAnchorMap: Record<string, string>;
  canvasImageAnchorMap: Record<string, string>;
};

type TutorialState = {
  isActive: boolean;
  stepIndex: number;
  entryPoint: TutorialEntryPoint | null;
  needsWorldOpen: boolean;
  cardAnchorMap: Record<string, string>;
  stickyNoteAnchorMap: Record<string, string>;
  canvasImageAnchorMap: Record<string, string>;
  satisfiedEvents: Set<TutorialAwaitEvent>;
  start: (entry: TutorialEntryPoint) => void;
  activate: (anchors: TutorialAnchorMaps) => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  complete: () => void;
  reset: () => void;
  notifyEvent: (event: TutorialAwaitEvent) => void;
  getCurrentStep: () => TutorialStep | null;
  canAdvance: () => boolean;
};

const initialAnchorMaps = {
  cardAnchorMap: {},
  stickyNoteAnchorMap: {},
  canvasImageAnchorMap: {},
};

export const useTutorial = create<TutorialState>((set, get) => ({
  isActive: false,
  stepIndex: 0,
  entryPoint: null,
  needsWorldOpen: false,
  ...initialAnchorMaps,
  satisfiedEvents: new Set(),

  start: (entry) => {
    set({
      isActive: true,
      stepIndex: 0,
      entryPoint: entry,
      needsWorldOpen: true,
      ...initialAnchorMaps,
      satisfiedEvents: new Set(),
    });
  },

  activate: (anchors) => {
    set({
      needsWorldOpen: false,
      cardAnchorMap: anchors.cardAnchorMap,
      stickyNoteAnchorMap: anchors.stickyNoteAnchorMap,
      canvasImageAnchorMap: anchors.canvasImageAnchorMap,
    });
  },

  next: () => {
    const { stepIndex } = get();
    if (stepIndex >= TUTORIAL_STEPS.length - 1) {
      get().complete();
      return;
    }
    set({ stepIndex: stepIndex + 1, satisfiedEvents: new Set() });
  },

  back: () => {
    set((state) => ({
      stepIndex: Math.max(0, state.stepIndex - 1),
      satisfiedEvents: new Set(),
    }));
  },

  skip: () => {
    get().complete();
  },

  complete: () => {
    set({
      isActive: false,
      stepIndex: 0,
      entryPoint: null,
      needsWorldOpen: false,
      ...initialAnchorMaps,
      satisfiedEvents: new Set(),
    });
  },

  reset: () => {
    set({
      isActive: false,
      stepIndex: 0,
      entryPoint: null,
      needsWorldOpen: false,
      ...initialAnchorMaps,
      satisfiedEvents: new Set(),
    });
  },

  notifyEvent: (event) => {
    const step = get().getCurrentStep();
    if (!step?.awaitEvent || step.awaitEvent !== event) {
      return;
    }
    set((state) => {
      const nextEvents = new Set(state.satisfiedEvents);
      nextEvents.add(event);
      return { satisfiedEvents: nextEvents };
    });
  },

  getCurrentStep: () => {
    const { stepIndex, isActive } = get();
    if (!isActive) {
      return null;
    }
    return TUTORIAL_STEPS[stepIndex] ?? null;
  },

  canAdvance: () => {
    const step = get().getCurrentStep();
    if (!step?.awaitEvent) {
      return true;
    }
    return get().satisfiedEvents.has(step.awaitEvent);
  },
}));

export function shouldShowTutorialPrompt(
  settings: {
    tutorialCompletedAt?: number;
    tutorialPromptDismissedAt?: number;
  } | null,
): boolean {
  if (!settings) {
    return false;
  }
  return !settings.tutorialCompletedAt && !settings.tutorialPromptDismissedAt;
}
