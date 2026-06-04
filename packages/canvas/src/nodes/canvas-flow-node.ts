import type { Node } from "@xyflow/react";
import type { CardFlowNode } from "./CardNode.js";
import type { ImageFlowNode } from "./ImageNode.js";
import type { NoteFlowNode } from "./NoteNode.js";

export type CanvasFlowNode = CardFlowNode | ImageFlowNode | NoteFlowNode;

export function isNoteFlowNode(node: Node): node is NoteFlowNode {
  return node.type === "worldnoteNote";
}

export function isImageFlowNode(node: Node): node is ImageFlowNode {
  return node.type === "worldnoteImage";
}
