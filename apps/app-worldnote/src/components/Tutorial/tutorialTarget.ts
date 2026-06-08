import type { TutorialTarget } from "./tutorialSteps.js";

export type TutorialAnchorMaps = {
  cardAnchorMap: Record<string, string>;
  stickyNoteAnchorMap: Record<string, string>;
  canvasImageAnchorMap: Record<string, string>;
};

const SPOTLIGHT_PADDING = 10;

export function resolveTutorialNodeId(
  target: TutorialTarget,
  anchors: TutorialAnchorMaps,
): string | null {
  if (target.kind === "card") {
    return anchors.cardAnchorMap[target.tutorialAnchor] ?? null;
  }
  if (target.kind === "stickyNote") {
    return anchors.stickyNoteAnchorMap[target.tutorialAnchor] ?? null;
  }
  if (target.kind === "canvasImage") {
    return anchors.canvasImageAnchorMap[target.imageKey] ?? null;
  }
  return null;
}

export function queryTutorialDomTarget(anchor: string): Element | null {
  return document.querySelector(`[data-tutorial-id="${anchor}"]`);
}

export function queryFlowNodeElement(nodeId: string): Element | null {
  return document.querySelector(`.react-flow__node[data-id="${nodeId}"]`);
}

export function measureTutorialTarget(
  target: TutorialTarget,
  anchors: TutorialAnchorMaps,
): DOMRect | null {
  if (target.kind === "none" || target.kind === "region") {
    return null;
  }

  if (target.kind === "dom") {
    const element = queryTutorialDomTarget(target.anchor);
    return element?.getBoundingClientRect() ?? null;
  }

  const nodeId = resolveTutorialNodeId(target, anchors);
  if (!nodeId) {
    return null;
  }

  const element = queryFlowNodeElement(nodeId);
  return element?.getBoundingClientRect() ?? null;
}

export function paddedSpotlightRect(
  rect: DOMRect,
  padding = SPOTLIGHT_PADDING,
  expand?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  },
): DOMRect {
  const expandTop = expand?.top ?? 0;
  const expandRight = expand?.right ?? 0;
  const expandBottom = expand?.bottom ?? 0;
  const expandLeft = expand?.left ?? 0;

  return new DOMRect(
    rect.left - padding - expandLeft,
    rect.top - padding - expandTop,
    rect.width + padding * 2 + expandLeft + expandRight,
    rect.height + padding * 2 + expandTop + expandBottom,
  );
}
