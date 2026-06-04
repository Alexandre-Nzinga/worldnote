import { STICKY_NOTE_COLORS, type StickyNoteColor } from "@worldnote/shared";
import {
  STICKY_NOTE_FG_VAR,
  STICKY_NOTE_MAX_HEIGHT,
  STICKY_NOTE_MAX_WIDTH,
  STICKY_NOTE_MIN_HEIGHT,
  STICKY_NOTE_MIN_WIDTH,
  STICKY_NOTE_TEXT_CLASS,
  stickyNoteSurfaceClass,
  useCanvasStickyNoteInteraction,
  type NoteFlowNode,
  type StickyNoteColorToken,
} from "@worldnote/canvas";
import { NodeResizer } from "@xyflow/react";
import { MaterialSymbol } from "@worldnote/ui";
import type { NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { memo, useCallback, useState } from "react";
import { MarkdownEditor } from "../../editor/MarkdownEditor.js";

function resolveToken(
  color: StickyNoteColor | StickyNoteColorToken,
): StickyNoteColorToken {
  return STICKY_NOTE_COLORS.includes(color as StickyNoteColor)
    ? (color as StickyNoteColorToken)
    : "amber-200";
}

function StickyNoteNodeInner({
  id,
  data,
  selected = false,
}: NodeProps<NoteFlowNode>) {
  const { onResizeEnd } = useCanvasStickyNoteInteraction();
  const [showHeading, setShowHeading] = useState(Boolean(data.heading));

  const editing = data.editing ?? false;
  const colorToken = resolveToken(data.color);
  const content = data.content ?? "";

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (!editing) {
        return;
      }
      const related = event.relatedTarget;
      if (related instanceof Node && event.currentTarget.contains(related)) {
        return;
      }
      data.onEndEdit?.();
    },
    [data, editing],
  );

  const handleBodyPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (editing) {
        return;
      }
      event.stopPropagation();
      data.onRequestEdit?.();
    },
    [data, editing],
  );

  const handleContentChange = useCallback(
    (markdown: string) => {
      data.onChange?.({ content: markdown });
    },
    [data],
  );

  const handleHeadingChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      data.onChangeHeading?.(value.trim() || undefined);
    },
    [data],
  );

  return (
    <motion.div
      className={`relative flex h-full min-h-0 flex-col rounded-lg shadow-sm ${stickyNoteSurfaceClass(colorToken)} ${
        selected
          ? "ring-2 ring-wn-mono-50 ring-offset-2 ring-offset-wn-mono-950"
          : ""
      }`}
      style={{ color: STICKY_NOTE_FG_VAR[colorToken] }}
      initial={data.enterAnimation ? { opacity: 0, scale: 0.92 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        if (!editing) {
          data.onRequestEdit?.();
        }
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={STICKY_NOTE_MIN_WIDTH}
        minHeight={STICKY_NOTE_MIN_HEIGHT}
        maxWidth={STICKY_NOTE_MAX_WIDTH}
        maxHeight={STICKY_NOTE_MAX_HEIGHT}
        handleClassName="!h-2.5 !w-2.5 !rounded-sm !border !border-wn-mono-50 !bg-wn-mono-800"
        lineClassName="!border-wn-mono-400"
        onResizeEnd={(_, params) => {
          onResizeEnd?.(id, {
            width: params.width,
            height: params.height,
          });
        }}
      />

      <div
        className="sticky-note-drag-handle flex shrink-0 cursor-grab items-center justify-center py-1 active:cursor-grabbing"
        title="Drag to move"
      >
        <MaterialSymbol
          name="drag_indicator"
          className={`pointer-events-none text-base opacity-50 ${STICKY_NOTE_TEXT_CLASS[colorToken]}`}
        />
      </div>

      <div
        className="nodrag nopan nowheel flex min-h-0 flex-1 flex-col"
        onPointerDown={handleBodyPointerDown}
        onBlur={handleBlur}
      >
        {editing && showHeading ? (
          <input
            type="text"
            value={data.heading ?? ""}
            placeholder="Heading"
            className="nodrag nowheel shrink-0 border-none bg-transparent px-3 pt-1 text-sm font-semibold outline-none placeholder:opacity-50"
            style={{ color: STICKY_NOTE_FG_VAR[colorToken] }}
            onChange={handleHeadingChange}
            onKeyDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          />
        ) : data.heading && !editing ? (
          <div className="shrink-0 px-3 pt-1 text-sm font-semibold">
            {data.heading}
          </div>
        ) : null}

        <div
          className={`sticky-note-editor flex min-h-0 flex-1 flex-col px-3 pb-3 ${
            data.heading && !editing ? "pt-1" : "pt-0"
          }`}
        >
          <MarkdownEditor
            value={content}
            editable={editing}
            placeholder="Start typing…"
            autoFocus={editing}
            proseClassName="sticky-note-editor-prose"
            onChange={handleContentChange}
          />
        </div>

        {editing ? (
          <div className="nodrag nowheel flex shrink-0 justify-end px-2 pb-2">
            <button
              type="button"
              className="rounded px-2 py-0.5 text-xs opacity-60 hover:opacity-100"
              onClick={() => {
                if (showHeading) {
                  data.onChangeHeading?.(undefined);
                }
                setShowHeading((prev) => !prev);
              }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              {showHeading ? "Hide heading" : "Add heading"}
            </button>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export const StickyNoteNode = memo(StickyNoteNodeInner);
StickyNoteNode.displayName = "StickyNoteNode";
