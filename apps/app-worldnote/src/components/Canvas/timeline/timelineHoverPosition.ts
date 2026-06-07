export const TIMELINE_HOVER_CARD_WIDTH = 176;
export const TIMELINE_HOVER_CARD_HEIGHT = 142;
export const TIMELINE_PERIOD_HOVER_CARD_HEIGHT = 72;

type RectLike = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function rectBottom(rect: RectLike): number {
  return rect.top + rect.height;
}

export function findTimelineItemElement(
  event: Event,
  mountNode: HTMLElement | null,
): HTMLElement | null {
  const target = event.target;
  if (!(target instanceof Element)) {
    return null;
  }
  const itemElement = target.closest(".vis-item");
  if (!(itemElement instanceof HTMLElement)) {
    return null;
  }
  if (mountNode && !mountNode.contains(itemElement)) {
    return null;
  }
  return itemElement;
}

export function computeTimelineHoverCardPosition(
  itemRect: RectLike,
  rootRect: RectLike,
  cardWidth = TIMELINE_HOVER_CARD_WIDTH,
  cardHeight = TIMELINE_HOVER_CARD_HEIGHT,
): { left: number; top: number } {
  const gap = 4;
  const itemCenterX = itemRect.left + itemRect.width / 2 - rootRect.left;
  const itemTop = itemRect.top - rootRect.top;
  const itemBottom = rectBottom(itemRect) - rootRect.top;

  let left = itemCenterX - cardWidth / 2;
  let top = itemTop - cardHeight - gap;

  if (top < 8) {
    top = itemBottom + gap;
  }

  left = Math.min(Math.max(8, left), rootRect.width - cardWidth - 8);
  top = Math.min(Math.max(8, top), rootRect.height - cardHeight - 8);

  return { left, top };
}
