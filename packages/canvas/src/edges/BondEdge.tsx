import { BaseEdge, type EdgeProps, getBezierPath } from "@xyflow/react";
import { memo } from "react";

export type BondEdgeData = { label?: string };

function BondEdgeInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      style={{ stroke: "var(--color-wn-mono-500)", strokeWidth: 2 }}
    />
  );
}

export const BondEdge = memo(BondEdgeInner);
BondEdge.displayName = "BondEdge";

