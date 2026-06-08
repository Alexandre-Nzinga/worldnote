import type { CanvasFlowNode } from "@worldnote/canvas";
import {
  useEffect,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { useTutorial } from "../../../hooks/useTutorial.js";
import { TUTORIAL_STEPS } from "../../Tutorial/tutorialSteps.js";
import { resolveTutorialNodeId } from "../../Tutorial/tutorialTarget.js";
import type { InspectorMode } from "../inspector/Inspector.js";

type UseTutorialCanvasEffectsOptions = {
  focusCardRef: MutableRefObject<((cardId: string) => void) | undefined>;
  setSelectedCardIds: Dispatch<SetStateAction<string[]>>;
  setSelectedLinkId: Dispatch<SetStateAction<string | null>>;
  setInspectorMode: Dispatch<SetStateAction<InspectorMode>>;
  setNodes: Dispatch<SetStateAction<CanvasFlowNode[]>>;
};

/** Selects and focuses cards when a tutorial step requires it. */
export function useTutorialCanvasEffects({
  focusCardRef,
  setSelectedCardIds,
  setSelectedLinkId,
  setInspectorMode,
  setNodes,
}: UseTutorialCanvasEffectsOptions) {
  const isActive = useTutorial((state) => state.isActive);
  const needsWorldOpen = useTutorial((state) => state.needsWorldOpen);
  const stepIndex = useTutorial((state) => state.stepIndex);
  const cardAnchorMap = useTutorial((state) => state.cardAnchorMap);
  const stickyNoteAnchorMap = useTutorial((state) => state.stickyNoteAnchorMap);
  const canvasImageAnchorMap = useTutorial(
    (state) => state.canvasImageAnchorMap,
  );

  useEffect(() => {
    if (!isActive || needsWorldOpen) {
      return;
    }

    const step = TUTORIAL_STEPS[stepIndex];
    if (!step) {
      return;
    }

    if (step.awaitEvent === "card-created") {
      setSelectedCardIds([]);
      setSelectedLinkId(null);
      setInspectorMode("read");
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          selected: false,
        })),
      );
      return;
    }

    if (!step.selectCard) {
      return;
    }

    const anchors = {
      cardAnchorMap,
      stickyNoteAnchorMap,
      canvasImageAnchorMap,
    };

    let cardId = resolveTutorialNodeId(step.target, anchors);
    if (!cardId && step.focusTutorialAnchor) {
      cardId = cardAnchorMap[step.focusTutorialAnchor] ?? null;
    }

    if (!cardId) {
      return;
    }

    setSelectedCardIds([cardId]);
    setSelectedLinkId(null);
    setInspectorMode("read");
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        selected: node.id === cardId,
      })),
    );
    queueMicrotask(() => focusCardRef.current?.(cardId));
  }, [
    canvasImageAnchorMap,
    cardAnchorMap,
    focusCardRef,
    isActive,
    needsWorldOpen,
    setInspectorMode,
    setNodes,
    setSelectedCardIds,
    setSelectedLinkId,
    stepIndex,
    stickyNoteAnchorMap,
  ]);
}
