import type { PointerEvent as ReactPointerEvent } from "react";

/** Drop targets (e.g. WorldWizard) mark themselves with this attribute. */
export const CANVAS_CARD_DROP_TARGET_ATTR = "data-worldnote-wizard-drop";

/** Fired on a drop target when a pointer drag from a card grip ends over it. */
export const CANVAS_CARD_DROP_EVENT = "worldnote-canvas-card-drop";

export type CanvasCardDropDetail = {
  cardId: string;
};

export function isCanvasCardDropEvent(
  event: Event,
): event is CustomEvent<CanvasCardDropDetail> {
  if (event.type !== CANVAS_CARD_DROP_EVENT) {
    return false;
  }
  if (!("detail" in event)) {
    return false;
  }
  const detail = event.detail;
  return (
    detail !== null &&
    typeof detail === "object" &&
    "cardId" in detail &&
    typeof detail.cardId === "string"
  );
}

const MIN_POINTER_DRAG_PX = 4;
export const CARD_EXTERNAL_POINTER_DRAG_BODY_CLASS =
  "wn-canvas-card-external-drag";

const ACTIVE_BODY_CLASS = CARD_EXTERNAL_POINTER_DRAG_BODY_CLASS;

/** True while a card grip pointer drag (WorldWizard drop) is in progress. */
export function isCardExternalPointerDragActive(): boolean {
  return document.body.classList.contains(ACTIVE_BODY_CLASS);
}

/** Card id currently being pointer-dragged from a canvas grip, once armed. */
export function getCardExternalPointerDragCardId(): string | null {
  return active?.armed ? active.cardId : null;
}

type ActivePointerDrag = {
  cardId: string;
  pointerId: number;
  startX: number;
  startY: number;
  armed: boolean;
};

let active: ActivePointerDrag | null = null;

function cleanup() {
  document.body.classList.remove(ACTIVE_BODY_CLASS);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("pointercancel", onPointerUp);
  active = null;
}

/** Cancel an in-progress pointer drag. */
export function cancelCardExternalPointerDrag() {
  cleanup();
}

function findDropTarget(clientX: number, clientY: number): HTMLElement | null {
  const hit = document.elementsFromPoint(clientX, clientY);
  for (const element of hit) {
    if (element instanceof HTMLElement) {
      const zone = element.closest(`[${CANVAS_CARD_DROP_TARGET_ATTR}]`);
      if (zone instanceof HTMLElement) {
        return zone;
      }
    }
  }

  // Fallback when the topmost hit is the canvas pane but the cursor is over a
  // fixed wizard panel (stacking / pointer-events quirks in WebView2).
  const zones = document.querySelectorAll<HTMLElement>(
    `[${CANVAS_CARD_DROP_TARGET_ATTR}]`,
  );
  for (const zone of zones) {
    const rect = zone.getBoundingClientRect();
    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      return zone;
    }
  }

  return null;
}

function dispatchCardDrop(target: HTMLElement, cardId: string) {
  const event = new CustomEvent<CanvasCardDropDetail>(CANVAS_CARD_DROP_EVENT, {
    detail: { cardId },
    bubbles: true,
  });
  target.dispatchEvent(event);
}

function onPointerMove(event: PointerEvent) {
  if (!active || event.pointerId !== active.pointerId) {
    return;
  }
  const dx = event.clientX - active.startX;
  const dy = event.clientY - active.startY;
  if (
    !active.armed &&
    dx * dx + dy * dy >= MIN_POINTER_DRAG_PX * MIN_POINTER_DRAG_PX
  ) {
    active.armed = true;
    document.body.classList.add(ACTIVE_BODY_CLASS);
  }
}

function onPointerUp(event: PointerEvent) {
  if (!active || event.pointerId !== active.pointerId) {
    return;
  }
  if (active.armed) {
    const target = findDropTarget(event.clientX, event.clientY);
    if (target) {
      dispatchCardDrop(target, active.cardId);
    }
  }
  cleanup();
}

/**
 * Starts a pointer drag from a card grip into external drop targets (WorldWizard).
 * Call from a capture-phase `pointerdown` on the grip so React Flow does not
 * start node dragging first.
 */
export function beginCardExternalPointerDrag(
  event: ReactPointerEvent<HTMLElement> | PointerEvent,
  cardId: string,
) {
  if (event.button !== 0 || !cardId) {
    return;
  }

  if (active) {
    cleanup();
  }

  event.preventDefault();
  event.stopPropagation();

  active = {
    cardId,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    armed: false,
  };

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
}
