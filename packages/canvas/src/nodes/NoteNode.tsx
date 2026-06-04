import type { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";
import { stickyNoteSurfaceClass } from "./sticky-note-styles.js";

import type { StickyNoteColorToken } from "./sticky-note-styles.js";

export type { StickyNoteColorToken } from "./sticky-note-styles.js";

export type NoteNodeData = {
  heading?: string;
  color: StickyNoteColorToken;
  content?: string;
  editing?: boolean;
  enterAnimation?: boolean;
  onChange?: (payload: { content: string }) => void;
  onChangeHeading?: (heading: string | undefined) => void;
  onChangeColor?: (color: StickyNoteColorToken) => void;
  onDelete?: () => void;
  onRequestEdit?: () => void;
  onEndEdit?: () => void;
};

export type NoteFlowNode = Node<NoteNodeData, "worldnoteNote">;

/** Minimal read-only fallback when no app editor is registered. */
function NoteNodeInner({ data }: NodeProps<NoteFlowNode>) {
  const body = data.content?.trim() || "Start typing…";
  return (
    <div
      className={`max-w-xs min-w-[240px] rounded-lg p-3 text-sm shadow-sm ${stickyNoteSurfaceClass(data.color)}`}
    >
      {data.heading ? (
        <div className="mb-1 font-semibold">{data.heading}</div>
      ) : null}
      <div className="whitespace-pre-wrap opacity-90">{body}</div>
    </div>
  );
}

export const NoteNode = memo(NoteNodeInner);
NoteNode.displayName = "NoteNode";
