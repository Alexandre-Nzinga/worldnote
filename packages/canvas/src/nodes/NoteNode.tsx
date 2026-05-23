import type { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";

export type NoteNodeData = { text: string };

export type NoteFlowNode = Node<NoteNodeData, "worldnoteNote">;

function NoteNodeInner({ data }: NodeProps<NoteFlowNode>) {
  return (
    <div className="max-w-xs rounded-lg border border-wn-amber-700/50 bg-wn-amber-950/80 p-2 text-sm text-wn-amber-100 shadow-md">
      {data.text}
    </div>
  );
}

export const NoteNode = memo(NoteNodeInner);
NoteNode.displayName = "NoteNode";
