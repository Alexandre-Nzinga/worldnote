import { type Node, type NodeProps, Position } from "@xyflow/react";
import { memo } from "react";

export type CardNodeData = {
  title: string;
  subtitle?: string;
};

export type CardFlowNode = Node<CardNodeData, "worldnoteCard">;

function CardNodeInner({ data }: NodeProps<CardFlowNode>) {
  return (
    <div className="min-w-[200px] rounded-[var(--radius-worldnote-card)] border-4 border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 shadow-lg">
      <div className="text-sm font-semibold">{data.title}</div>
      {data.subtitle ? (
        <div className="text-xs text-zinc-400">{data.subtitle}</div>
      ) : null}
    </div>
  );
}

export const CardNode = memo(CardNodeInner);
CardNode.displayName = "CardNode";

export const cardNodeDefaults = {
  sourcePosition: Position.Bottom,
  targetPosition: Position.Top,
} as const;
