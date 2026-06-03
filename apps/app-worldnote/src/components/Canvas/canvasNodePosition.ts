type XY = { x: number; y: number };

/** Ensures React Flow always receives finite node coordinates. */
export function canvasNodePosition(
  placement: XY | undefined,
  fallback: XY | undefined,
): XY {
  const candidate = placement ?? fallback;
  if (
    candidate &&
    Number.isFinite(candidate.x) &&
    Number.isFinite(candidate.y)
  ) {
    return candidate;
  }
  return { x: 0, y: 0 };
}
