import type { CardFlowNode } from "./CardNode.js";
import type { ImageFlowNode } from "./ImageNode.js";
import type { NoteFlowNode } from "./NoteNode.js";

export type CanvasFlowNode = CardFlowNode | ImageFlowNode | NoteFlowNode;
