import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useTutorial } from "../../../../hooks/useTutorial.js";
import { TUTORIAL_STEPS } from "../../../Tutorial/tutorialSteps.js";
import { resolveTutorialNodeId } from "../../../Tutorial/tutorialTarget.js";

/** Pans/zooms the canvas for the active tutorial step; must render inside ReactFlowProvider. */
export function TutorialCanvasBridge() {
  const { fitView, setCenter, getNode } = useReactFlow();
  const isActive = useTutorial((state) => state.isActive);
  const stepIndex = useTutorial((state) => state.stepIndex);
  const needsWorldOpen = useTutorial((state) => state.needsWorldOpen);
  const cardAnchorMap = useTutorial((state) => state.cardAnchorMap);
  const stickyNoteAnchorMap = useTutorial((state) => state.stickyNoteAnchorMap);
  const canvasImageAnchorMap = useTutorial(
    (state) => state.canvasImageAnchorMap,
  );

  const step = isActive && !needsWorldOpen ? TUTORIAL_STEPS[stepIndex] : null;

  useEffect(() => {
    if (!step) {
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;

    const anchors = {
      cardAnchorMap,
      stickyNoteAnchorMap,
      canvasImageAnchorMap,
    };

    const finishFocus = () => {
      if (!cancelled) {
        window.dispatchEvent(new CustomEvent("wn-tutorial-focus-ready"));
      }
    };

    const scheduleFinish = (delayMs: number) => {
      timeoutId = window.setTimeout(finishFocus, delayMs);
    };

    if (step.target.kind === "region" && step.target.value === "canvas") {
      void fitView({ padding: 0.16, maxZoom: 0.85, duration: 450 });
      scheduleFinish(480);
      return () => {
        cancelled = true;
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    const nodeId = resolveTutorialNodeId(step.target, anchors);
    if (nodeId) {
      const node = getNode(nodeId);
      if (!node) {
        finishFocus();
      } else {
        const height = node.measured?.height ?? 180;
        const centerY = node.position.y + height / 2;
        void setCenter(node.position.x, centerY, {
          zoom: 1,
          duration: 400,
        });
        scheduleFinish(450);
      }
      return () => {
        cancelled = true;
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    finishFocus();
    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [
    canvasImageAnchorMap,
    cardAnchorMap,
    fitView,
    getNode,
    setCenter,
    step,
    stickyNoteAnchorMap,
  ]);

  return null;
}
