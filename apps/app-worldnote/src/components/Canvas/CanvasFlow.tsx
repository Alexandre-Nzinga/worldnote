import {
  CanvasImageInteractionProvider,
  CanvasStickyNoteInteractionProvider,
  WorldNoteCanvas,
  type CanvasFlowNode,
} from "@worldnote/canvas";
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
import type {
  MouseEvent as ReactMouseEvent,
  MutableRefObject,
  RefObject,
} from "react";
import type { CanvasImageContextMenuState } from "./CanvasImageContextMenu.js";
import {
  CanvasCardContextMenu,
  type CanvasCardContextMenuState,
} from "./CanvasCardContextMenu.js";
import { CanvasImageContextMenu } from "./CanvasImageContextMenu.js";
import {
  CanvasStickyNoteContextMenu,
  type CanvasStickyNoteContextMenuState,
} from "./CanvasStickyNoteContextMenu.js";
import type { Link, WorldCard } from "@worldnote/shared";
import type { NewCardType } from "../../services/crudWorldCard/cardTemplates.js";
import type { VisibleSocketsByCardType } from "../../services/settings/settings.js";
import {
  BulkSelectionToolbar,
  type BulkSelectionKind,
} from "./BulkSelectionToolbar.js";
import { CanvasExternalImageDropBridge } from "./CanvasExternalImageDropBridge.js";
import { CanvasFitViewBridge } from "./CanvasFitViewBridge.js";
import { CanvasFocusBridge } from "./CanvasFocusBridge.js";
import type {
  CanvasImageDropPosition,
  CanvasImageImportOptions,
} from "./useCanvasExternalImageDrop.js";
import { useCanvasConnectionEnd } from "./useCanvasConnectionEnd.js";
import { useCanvasPointerTracking } from "./useCanvasPointerTracking.js";
import type { CanvasPointerApi } from "./useCanvasPointerTracking.js";
import type { CanvasFlowPointer } from "../../services/canvas/canvasSpawnPosition.js";
import { useResolvedTheme } from "../../theme/ThemeProvider.js";

type CanvasFlowProps = {
  nodeTypes: NodeTypes;
  edgeTypes: EdgeTypes;
  nodes: CanvasFlowNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange<Edge>;
  onSelectionChange: (params: OnSelectionChangeParams) => void;
  onConnect: OnConnect;
  isValidConnection: (connection: Connection | Edge) => boolean;
  onNodeDragStart?: () => void;
  onNodeDragStop: (event: ReactMouseEvent, node: Node) => void;
  onNodeDoubleClick: (event: ReactMouseEvent, node: Node) => void;
  onEdgeDoubleClick: (event: ReactMouseEvent, edge: Edge) => void;
  onNodeContextMenu: (event: ReactMouseEvent, node: Node) => void;
  onPaneClick: () => void;
  imageContextMenu: CanvasImageContextMenuState | null;
  onCloseImageContextMenu: () => void;
  cardContextMenu: CanvasCardContextMenuState | null;
  onCloseCardContextMenu: () => void;
  onCardContextDuplicate: (cardId: string) => void;
  onCardContextCopy: (cardId: string) => void;
  onCardContextShowChangeType: (cardId: string) => void;
  onCardContextBackToActions: () => void;
  onCardChangeType: (cardId: string, newType: NewCardType) => void;
  onCardContextDelete: (cardId: string) => void;
  onDuplicateCanvasImage: (imageId: string) => void;
  onDeleteCanvasImage: (imageId: string) => void;
  onFlipCanvasImageHorizontal: (imageId: string) => void;
  onFlipCanvasImageVertical: (imageId: string) => void;
  onRotateCanvasImageClockwise: (imageId: string) => void;
  onImageResizeEnd: (nodeId: string, size: { width: number; height: number }) => void;
  stickyNoteContextMenu: CanvasStickyNoteContextMenuState | null;
  onCloseStickyNoteContextMenu: () => void;
  onDuplicateStickyNote: (noteId: string) => void;
  onCopyStickyNote: (noteId: string) => void;
  onDeleteStickyNote: (noteId: string) => void;
  onStickyNoteResizeEnd: (nodeId: string, size: { width: number; height: number }) => void;
  nodesDraggable?: boolean;
  vaultPath: string | null;
  cardsByIdRef: RefObject<Record<string, WorldCard>>;
  linksByIdRef: RefObject<Record<string, Link>>;
  visibleSocketsSettingsRef: RefObject<VisibleSocketsByCardType | undefined>;
  setNodes: React.Dispatch<React.SetStateAction<CanvasFlowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setCardsById: React.Dispatch<React.SetStateAction<Record<string, WorldCard>>>;
  setLinksById: React.Dispatch<React.SetStateAction<Record<string, Link>>>;
  setSelectedCardIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedLinkId: React.Dispatch<React.SetStateAction<string | null>>;
  setInspectorMode: React.Dispatch<React.SetStateAction<"read" | "edit">>;
  selectedCardIds: string[];
  selectedImageIds: string[];
  onDuplicateSelection: () => Promise<void>;
  onDeleteSelection: () => Promise<void>;
  onCreateGroupFromSelection?: () => Promise<void>;
  focusCardRef: MutableRefObject<((cardId: string) => void) | undefined>;
  lastCanvasPointerRef: MutableRefObject<CanvasFlowPointer | null>;
  canvasPointerApiRef: MutableRefObject<CanvasPointerApi | null>;
  onImportCanvasImage: (
    sourcePath: string,
    flowPosition: CanvasImageDropPosition,
    options?: CanvasImageImportOptions,
  ) => Promise<void>;
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
  onNodeDragStart,
  onNodeDragStop,
  onNodeDoubleClick,
  onEdgeDoubleClick,
  onNodeContextMenu,
  onPaneClick,
  imageContextMenu,
  onCloseImageContextMenu,
  cardContextMenu,
  onCloseCardContextMenu,
  onCardContextDuplicate,
  onCardContextCopy,
  onCardContextShowChangeType,
  onCardContextBackToActions,
  onCardChangeType,
  onCardContextDelete,
  onDuplicateCanvasImage,
  onDeleteCanvasImage,
  onFlipCanvasImageHorizontal,
  onFlipCanvasImageVertical,
  onRotateCanvasImageClockwise,
  onImageResizeEnd,
  stickyNoteContextMenu,
  onCloseStickyNoteContextMenu,
  onDuplicateStickyNote,
  onCopyStickyNote,
  onDeleteStickyNote,
  onStickyNoteResizeEnd,
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
  selectedImageIds,
  onDuplicateSelection,
  onDeleteSelection,
  onCreateGroupFromSelection,
  focusCardRef,
  lastCanvasPointerRef,
  canvasPointerApiRef,
  onImportCanvasImage,
}: CanvasFlowProps) {
  useCanvasPointerTracking({
    lastPointerRef: lastCanvasPointerRef,
    pointerApiRef: canvasPointerApiRef,
  });

  const bulkSelection =
    selectedCardIds.length > 1
      ? { kind: "card" as BulkSelectionKind, ids: selectedCardIds }
      : selectedImageIds.length > 1
        ? { kind: "image" as BulkSelectionKind, ids: selectedImageIds }
        : null;
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
    <CanvasStickyNoteInteractionProvider value={{ onResizeEnd: onStickyNoteResizeEnd }}>
    <CanvasImageInteractionProvider value={{ onResizeEnd: onImageResizeEnd }}>
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
      minZoom={0.15}
      maxZoom={4}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
      onNodeDoubleClick={onNodeDoubleClick}
      onEdgeDoubleClick={onEdgeDoubleClick}
      onNodeContextMenu={onNodeContextMenu}
      onPaneClick={onPaneClick}
    >
      <CanvasFitViewBridge
        vaultPath={vaultPath}
        nodeCount={nodes.length}
      />
      <CanvasFocusBridge focusCardRef={focusCardRef} />
      <CanvasExternalImageDropBridge
        enabled={Boolean(vaultPath)}
        vaultPath={vaultPath}
        onImportImage={onImportCanvasImage}
      />
      {bulkSelection ? (
        <BulkSelectionToolbar
          selectedIds={bulkSelection.ids}
          selectionKind={bulkSelection.kind}
          onDuplicate={onDuplicateSelection}
          onDelete={onDeleteSelection}
          onCreateGroup={onCreateGroupFromSelection}
        />
      ) : null}
    </WorldNoteCanvas>
    <CanvasImageContextMenu
      menu={imageContextMenu}
      onClose={onCloseImageContextMenu}
      onDuplicate={onDuplicateCanvasImage}
      onDelete={onDeleteCanvasImage}
      onFlipHorizontal={onFlipCanvasImageHorizontal}
      onFlipVertical={onFlipCanvasImageVertical}
      onRotateClockwise={onRotateCanvasImageClockwise}
    />
    <CanvasCardContextMenu
      menu={cardContextMenu}
      currentCardType={
        cardContextMenu
          ? cardsByIdRef.current[cardContextMenu.cardId]?.card_type
          : undefined
      }
      onClose={onCloseCardContextMenu}
      onDuplicate={onCardContextDuplicate}
      onCopy={onCardContextCopy}
      onShowChangeType={onCardContextShowChangeType}
      onBackToActions={onCardContextBackToActions}
      onChangeType={onCardChangeType}
      onDelete={onCardContextDelete}
    />
    <CanvasStickyNoteContextMenu
      menu={stickyNoteContextMenu}
      onClose={onCloseStickyNoteContextMenu}
      onDuplicate={onDuplicateStickyNote}
      onCopy={onCopyStickyNote}
      onDelete={onDeleteStickyNote}
    />
    </CanvasImageInteractionProvider>
    </CanvasStickyNoteInteractionProvider>
  );
}
