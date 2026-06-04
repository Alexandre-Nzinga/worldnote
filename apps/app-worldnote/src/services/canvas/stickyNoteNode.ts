import {
  stickyNoteNodeStyle,
  stickyNoteSurfaceClass,
  type NoteFlowNode,
  type NoteNodeData,
  type StickyNotePlacement,
} from "@worldnote/canvas";
import {
  DEFAULT_STICKY_NOTE_COLOR,
  StickyNoteSchema,
  type StickyNote,
  type StickyNoteColor,
  StickyNoteColorSchema,
} from "@worldnote/shared";

export type StickyNoteNodeCallbacks = {
  onChange?: NoteNodeData["onChange"];
  onChangeHeading?: NoteNodeData["onChangeHeading"];
  onChangeColor?: NoteNodeData["onChangeColor"];
  onDelete?: NoteNodeData["onDelete"];
  onRequestEdit?: NoteNodeData["onRequestEdit"];
  onEndEdit?: NoteNodeData["onEndEdit"];
};

function resolveNoteColor(color: string | undefined): StickyNoteColor {
  const parsed = StickyNoteColorSchema.safeParse(color);
  return parsed.success ? parsed.data : DEFAULT_STICKY_NOTE_COLOR;
}

export function stickyNoteDimensionsFromPlacement(
  placement: StickyNotePlacement,
): {
  width: number;
  height: number;
} {
  return stickyNoteNodeStyle(placement.width, placement.height);
}

export function stickyNoteDimensionsFromNode(node: NoteFlowNode): {
  width?: number;
  height?: number;
} {
  const width = node.style?.width;
  const height = node.style?.height;
  return {
    width: typeof width === "number" ? width : undefined,
    height: typeof height === "number" ? height : undefined,
  };
}

export function stickyNotePlacementToNodeData(
  placement: StickyNotePlacement,
  content: string,
  callbacks: StickyNoteNodeCallbacks,
  options?: {
    editing?: boolean;
    enterAnimation?: boolean;
  },
): NoteNodeData {
  return {
    heading: placement.heading,
    color: resolveNoteColor(placement.color),
    content,
    editing: options?.editing,
    enterAnimation: options?.enterAnimation,
    ...callbacks,
  };
}

export function stickyNotePlacementToFlowNode(
  placement: StickyNotePlacement,
  content: string,
  callbacks: StickyNoteNodeCallbacks,
  options?: {
    selected?: boolean;
    editing?: boolean;
    enterAnimation?: boolean;
    draggable?: boolean;
  },
): NoteFlowNode {
  const color = resolveNoteColor(placement.color);
  const size = stickyNoteDimensionsFromPlacement(placement);
  return {
    id: placement.id,
    type: "worldnoteNote",
    position: { x: placement.x, y: placement.y },
    connectable: false,
    selected: options?.selected,
    draggable: options?.draggable ?? !options?.editing,
    style: size,
    data: stickyNotePlacementToNodeData(placement, content, callbacks, {
      editing: options?.editing,
      enterAnimation: options?.enterAnimation,
    }),
    className: stickyNoteSurfaceClass(color),
  };
}

export function stickyNoteFromFlowNode(node: NoteFlowNode): StickyNote {
  const { width, height } = stickyNoteDimensionsFromNode(node);
  const dims = stickyNoteNodeStyle(width, height);
  return StickyNoteSchema.parse({
    id: node.id,
    heading: node.data.heading,
    content: node.data.content ?? "",
    color: node.data.color,
    position: { x: node.position.x, y: node.position.y },
    width: dims.width,
    height: dims.height,
  });
}

export function stickyNotePlacementFromFlowNode(
  node: NoteFlowNode,
): StickyNotePlacement {
  const { width, height } = stickyNoteDimensionsFromNode(node);
  return {
    id: node.id,
    x: node.position.x,
    y: node.position.y,
    heading: node.data.heading,
    color: node.data.color,
    width,
    height,
  };
}
