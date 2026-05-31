import { WorldNoteCanvas, type CardFlowNode } from "@worldnote/canvas";
import {
  ConnectionMode,
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
import type { MouseEvent, RefObject } from "react";
import type { Link, WorldCard } from "@worldnote/shared";
import type { VisibleSocketsByCardType } from "../../services/settings/settings.js";
import { useCanvasConnectionEnd } from "./useCanvasConnectionEnd.js";

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
  vaultPath: string | null;
  cardsByIdRef: RefObject<Record<string, WorldCard>>;
  linksByIdRef: RefObject<Record<string, Link>>;
  visibleSocketsSettingsRef: RefObject<VisibleSocketsByCardType | undefined>;
  setNodes: React.Dispatch<React.SetStateAction<CardFlowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setCardsById: React.Dispatch<React.SetStateAction<Record<string, WorldCard>>>;
  setLinksById: React.Dispatch<React.SetStateAction<Record<string, Link>>>;
  setSelectedCardId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedLinkId: React.Dispatch<React.SetStateAction<string | null>>;
  setInspectorMode: React.Dispatch<React.SetStateAction<"read" | "edit">>;
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
  vaultPath,
  cardsByIdRef,
  linksByIdRef,
  visibleSocketsSettingsRef,
  setNodes,
  setEdges,
  setCardsById,
  setLinksById,
  setSelectedCardId,
  setSelectedLinkId,
  setInspectorMode,
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
    setSelectedCardId,
    setSelectedLinkId,
    setInspectorMode,
  });

  const onNodeMouseEnter = onCardMouseEnter as NodeMouseHandler<Node>;
  const onNodeMouseLeave = onCardMouseLeave as NodeMouseHandler<Node>;

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
      colorMode="dark"
      panOnDrag={[1]}
      panOnScroll={false}
      zoomOnScroll
      zoomOnPinch
      nodesDraggable
      nodesConnectable
      elementsSelectable
      minZoom={0.25}
      maxZoom={2}
      onNodeDragStop={onNodeDragStop}
      onNodeDoubleClick={onNodeDoubleClick}
      onEdgeDoubleClick={onEdgeDoubleClick}
      fitView
    />
  );
}
