import { type Node, type NodeProps, Position } from "@xyflow/react";
import { memo } from "react";

export type GroupNodeData = { label: string };

export type GroupFlowNode = Node<GroupNodeData, "worldnoteGroup">;

function GroupNodeInner({ data }: NodeProps<GroupFlowNode>) {
  return (
    <div className="min-h-[120px] min-w-[240px] rounded-[var(--radius-2xl)] border-2 border-dashed border-wn-mono-600 bg-wn-mono-950/40 p-3 text-wn-mono-300">
      <div className="text-xs font-medium uppercase tracking-wide text-wn-mono-500">
        {data.label}
      </div>
    </div>
  );
}

export const GroupNode = memo(GroupNodeInner);
GroupNode.displayName = "GroupNode";

export const groupNodeDefaults = {
  sourcePosition: Position.Bottom,
  targetPosition: Position.Top,
} as const;
