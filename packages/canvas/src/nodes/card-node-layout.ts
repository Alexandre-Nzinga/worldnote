/** Pixel layout for node-view card chrome (must match CardNodeView Tailwind). */
const HEADER_PT = 48; // pt-12
const HEADER_PB = 12; // pb-3
const TITLE_LINE = 20;
const SUBTITLE_BLOCK = 18; // text-xs + pt-0.5
const HEADER_BORDER = 1;
const SOCKET_LIST_PY = 12; // py-3
const SOCKET_ROW_H = 36; // h-9
const SOCKET_ROW_GAP = 6; // gap-1.5

function headerHeight(hasSubtitle: boolean): number {
  return (
    HEADER_PT +
    HEADER_PB +
    TITLE_LINE +
    (hasSubtitle ? SUBTITLE_BLOCK : 0) +
    HEADER_BORDER
  );
}

export type NodeViewHandlePositions = {
  rowTops: number[];
  entityTop: number;
};

/** Deterministic handle Y positions (px from top of node root). */
export function getNodeViewHandlePositions(
  socketCount: number,
  options?: { hasSubtitle?: boolean },
): NodeViewHandlePositions {
  const listTop = headerHeight(options?.hasSubtitle ?? false);

  const rowTops = Array.from({ length: socketCount }, (_, index) => {
    const rowStart = listTop + SOCKET_LIST_PY + index * (SOCKET_ROW_H + SOCKET_ROW_GAP);
    return rowStart + SOCKET_ROW_H / 2;
  });

  const listContentHeight =
    socketCount === 0
      ? 0
      : socketCount * SOCKET_ROW_H + (socketCount - 1) * SOCKET_ROW_GAP;

  const entityTop =
    socketCount === 0
      ? listTop + SOCKET_LIST_PY
      : listTop + SOCKET_LIST_PY + listContentHeight / 2;

  return { rowTops, entityTop };
}

/** Center handle on the anchor point (matches React Flow side-handle default). */
export function handleStyleAtTop(top: number): { top: number; transform: string } {
  return { top, transform: "translate(-50%, -50%)" };
}
