import { WorldNoteCanvas, type CardFlowNode } from "@worldnote/canvas";
import {
  ConnectionMode,
  SelectionMode,
  type Connection,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeMouseHandler,
  type NodeTypes,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import type { MouseEvent, MutableRefObject, RefObject } from "react";
import type { Link, WorldCard } from "@worldnote/shared";
import type { VisibleSocketsByCardType } from "../../services/settings/settings.js";
import { BulkSelectionToolbar } from "./BulkSelectionToolbar.js";
import { CanvasFocusBridge } from "./CanvasFocusBridge.js";
import { useCanvasConnectionEnd } from "./useCanvasConnectionEnd.js";
import { useResolvedTheme } from "../../theme/ThemeProvider.js";

type CanvasFlowProps = {
  nodeTypes: NodeTypes;
  edgeTypes: EdgeTypes;
  nodes: CardFlowNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange<Edge>;
  onSelectionChange: (params: OnSelectionChangeParams) => void;
  onConnect: OnConnect;
  isValidConnection: (connection: Connection | Edge) => boolean;
  onNodeDragStop: (event: MouseEvent, node: Node) => void;
  onNodeDoubleClick: (event: MouseEvent, node: Node) => void;
  onEdgeDoubleClick: (event: MouseEvent, edge: Edge) => void;
  nodesDraggable?: boolean;
  vaultPath: string | null;
  cardsByIdRef: RefObject<Record<string, WorldCard>>;
  linksByIdRef: RefObject<Record<string, Link>>;
  visibleSocketsSettingsRef: RefObject<VisibleSocketsByCardType | undefined>;
  setNodes: React.Dispatch<React.SetStateAction<CardFlowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setCardsById: React.Dispatch<React.SetStateAction<Record<string, WorldCard>>>;
  setLinksById: React.Dispatch<React.SetStateAction<Record<string, Link>>>;
  setSelectedCardIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedLinkId: React.Dispatch<React.SetStateAction<string | null>>;
  setInspectorMode: React.Dispatch<React.SetStateAction<"read" | "edit">>;
  selectedCardIds: string[];
  onDuplicateSelectedCards: () => Promise<void>;
  onDeleteSelectedCards: () => Promise<void>;
  focusCardRef: MutableRefObject<((cardId: string) => void) | undefined>;
};

export function CanvasFlow({
  nodeTypes,
  edgeTypes,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onSelectionChange,
  onConnect,
  isValidConnection,
  onNodeDragStop,
  onNodeDoubleClick,
  onEdgeDoubleClick,
  nodesDraggable = true,
  vaultPath,
  cardsByIdRef,
  linksByIdRef,
  visibleSocketsSettingsRef,
  setNodes,
  setEdges,
  setCardsById,
  setLinksById,
  setSelectedCardIds,
  setSelectedLinkId,
  setInspectorMode,
  selectedCardIds,
  onDuplicateSelectedCards,
  onDeleteSelectedCards,
  focusCardRef,
}: CanvasFlowProps) {
  const {
    onConnectStart,
    onConnectEnd,
    onNodeMouseEnter: onCardMouseEnter,
    onNodeMouseLeave: onCardMouseLeave,
  } = useCanvasConnectionEnd({
    vaultPath,
    cardsByIdRef,
    linksByIdRef,
    visibleSocketsSettingsRef,
    onConnect,
    setNodes,
    setEdges,
    setCardsById,
    setLinksById,
    setSelectedCardIds,
    setSelectedLinkId,
    setInspectorMode,
  });

  const onNodeMouseEnter = onCardMouseEnter as NodeMouseHandler<Node>;
  const onNodeMouseLeave = onCardMouseLeave as NodeMouseHandler<Node>;

  const resolvedTheme = useResolvedTheme();

  return (
    <WorldNoteCanvas
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onSelectionChange={onSelectionChange}
      onConnect={onConnect}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      isValidConnection={isValidConnection}
      connectionMode={ConnectionMode.Loose}
      connectionRadius={40}
      nodeOrigin={[0.5, 0]}
      className="h-full w-full rounded-none border-0"
      backgroundVariant="dots"
      backgroundColor="var(--color-wn-mono-700)"
      backgroundGap={16}
      colorMode={resolvedTheme}
      panOnDrag={[1, 2]}
      panOnScroll={false}
      zoomOnScroll
      zoomOnPinch
      nodesDraggable={nodesDraggable}
      nodesConnectable
      elementsSelectable
      selectNodesOnDrag={false}
      selectionOnDrag
      selectionMode={SelectionMode.Partial}
      selectionKeyCode={null}
      panActivationKeyCode="Space"
      minZoom={0.25}
      maxZoom={2}
      onNodeDragStop={onNodeDragStop}
      onNodeDoubleClick={onNodeDoubleClick}
      onEdgeDoubleClick={onEdgeDoubleClick}
      fitView
    >
      <CanvasFocusBridge focusCardRef={focusCardRef} />
      {selectedCardIds.length > 1 ? (
        <BulkSelectionToolbar
          selectedCardIds={selectedCardIds}
          onDuplicate={onDuplicateSelectedCards}
          onDelete={onDeleteSelectedCards}
        />
      ) : null}
    </WorldNoteCanvas>
  );
}
