import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  useInternalNode,
} from "@xyflow/react";
import { memo } from "react";
import { getFloatingEdgeParams } from "./floating-edge-utils.js";

export type LinkEdgeData = { sourceSocket?: string };

function formatSocketLabel(socket: string): string {
  return socket.replace(/_/g, " ");
}

function LinkEdgeInner({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const linkData = data as LinkEdgeData | undefined;
  const label = linkData?.sourceSocket
    ? formatSocketLabel(linkData.sourceSocket)
    : undefined;

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  const floating =
    sourceNode && targetNode
      ? getFloatingEdgeParams(sourceNode, targetNode, {
          sourceHandleY: sourceY,
          targetHandleY: targetY,
        })
      : null;

  const sx = floating?.sx ?? sourceX;
  const sy = floating?.sy ?? sourceY;
  const tx = floating?.tx ?? targetX;
  const ty = floating?.ty ?? targetY;
  const sp = floating?.sourcePosition ?? sourcePosition;
  const tp = floating?.targetPosition ?? targetPosition;

  const [path, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sp,
    targetX: tx,
    targetY: ty,
    targetPosition: tp,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: selected
            ? "var(--color-wn-mono-200)"
            : "var(--color-wn-mono-500)",
          strokeWidth: selected ? 2.5 : 2,
        }}
      />
      {label && selected ? (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-all rounded-md border border-wn-mono-700 bg-wn-mono-900 px-2 py-0.5 text-[11px] font-medium text-wn-mono-200 shadow-sm"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export const LinkEdge = memo(LinkEdgeInner);
LinkEdge.displayName = "LinkEdge";
