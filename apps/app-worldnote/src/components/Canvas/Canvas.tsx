import {
  canonicalSocketId,
  CardNode,
  canvasImageNodeStyle,
  canvasImageNodeStyleForNaturalSize,
  ImageNode,
  isImageFlowNode,
  isNoteFlowNode,
  LinkEdge,
  type CanvasFlowNode,
  type CardFlowNode,
  type ImageFlowNode,
  type NoteFlowNode,
  stickyNoteSurfaceClass,
} from "@worldnote/canvas";
import {
  applyNodeChanges,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type EdgeTypes,
  type Node,
  type NodeChange,
  type NodeMouseHandler,
  type OnNodesChange,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import {
  CARD_TYPE_LABELS,
  DEFAULT_STICKY_NOTE_COLOR,
  flipCardImageHorizontal,
  flipCardImageVertical,
  NEW_CARD_DEFAULT_NAMES,
  rotateCardImageClockwise,
  StickyNotePlacementSchema,
  type CardImagePosition,
  type FamilyCard,
  type Link,
  type CalendarConfig,
  type Era,
  type Period,
  type WorldCard,
} from "@worldnote/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, MouseEvent } from "react";
import { useCardCommands } from "../../hooks/useCardCommands.js";
import { useTimelineCommands } from "../../hooks/useTimelineCommands.js";
import { useSettings } from "../../hooks/useSettings.js";
import { useVault } from "../../hooks/useVault.js";
import { WIZARD_CARD_MIME, readVaultCardRefPayload } from "../../services/canvas/cardDragOut.js";
import { cardImageSrc, cardNodeSaveCallbacks, worldCardToNodeData } from "../../services/canvas/cardNodeData.js";
import { resolveCardBadgeStyle } from "../../services/settings/cardTypeBadgeSettings.js";
import { resolveKinshipBadgeStyle } from "../../services/settings/kinshipBadgeSettings.js";
import {
  removeCanvasManifestStickyNote,
  updateCanvasManifestImage,
  updateCanvasManifestNode,
  updateCanvasManifestStickyNote,
} from "../../services/canvas/canvasManifest.js";
import {
  imagePlacementToFlowNode,
  vaultAbsoluteImagePath,
} from "../../services/canvas/canvasImageNode.js";
import {
  canvasImageNodeWithPosition,
  canvasImagePlacementFromFlowNode,
  defaultCanvasImageNodePosition,
} from "../../services/canvas/canvasImagePlacement.js";
import { loadImageNaturalSize } from "../../services/canvas/loadImageNaturalSize.js";
import {
  CANVAS_IMAGE_SPAWN_ANCHOR_OFFSET,
  type CanvasFlowPointer,
} from "../../services/canvas/canvasSpawnPosition.js";
import {
  stickyNoteDimensionsFromNode,
  stickyNoteFromFlowNode,
  stickyNotePlacementFromFlowNode,
  stickyNotePlacementToFlowNode,
  type StickyNoteNodeCallbacks,
} from "../../services/canvas/stickyNoteNode.js";
import {
  deleteStickyNoteMarkdown,
  serializeStickyNoteMarkdown,
  writeStickyNoteMarkdown,
} from "../../services/canvas/stickyNoteMarkdown.js";
import { createCanvasImagePositionUpdater } from "../../services/canvas/updateCanvasImagePosition.js";
import {
  createStickyNoteManifestUpdater,
  createStickyNoteMarkdownUpdater,
  createStickyNotePositionUpdater,
} from "../../services/canvas/updateStickyNotePosition.js";
import { snapFlowPosition } from "../../services/canvas/canvasLayout.js";
import { createCardPositionUpdater } from "../../services/canvas/updateCardPosition.js";
import {
  deleteCanvasImage,
  pickCardImageFile,
  saveCanvasImage,
} from "../../services/desktop/saveCanvasImage.js";
import { isTauriRuntime } from "../../services/desktop/tauriRuntime.js";
import { createWorldCard } from "../../services/crudWorldCard/createWorldCard.js";
import {
  centerPositionForGroup,
  groupSelectedWorldCards,
} from "../../services/crudWorldCard/groupSelectedWorldCards.js";
import { changeWorldCardType } from "../../services/crudWorldCard/changeWorldCardType.js";
import type { NewCardType } from "../../services/crudWorldCard/cardTemplates.js";
import { isNewCardType } from "../../services/crudWorldCard/creatableCardTypes.js";
import { withCardPatch } from "../../services/crudWorldCard/withCardPatch.js";
import { deleteWorldCard } from "../../services/crudWorldCard/deleteWorldCard.js";
import {
  duplicatedCardsOnCanvas,
  duplicateWorldCardsWithGroup,
  expandCardIdsIncludingGroupMembers,
} from "../../services/crudWorldCard/duplicateWorldCardsWithGroup.js";
import { updateWorldCard } from "../../services/crudWorldCard/updateWorldCard.js";
import { createLink } from "../../services/links/createLink.js";
import { deleteLink } from "../../services/links/deleteLink.js";
import { linkToEdge } from "../../services/links/linkToEdge.js";
import { listLinks } from "../../services/links/listLinks.js";
import { LinkEditorPanel } from "./card-editor/LinkEditorPanel.js";
import { Inspector, type InspectorMode } from "./inspector/Inspector.js";
import { openCanvasCardContextMenuRef } from "../../services/canvas/canvasCardContextMenuRef.js";
import { applyCanvasCardSelectionRef } from "../../services/canvas/canvasCardSelectionRef.js";
import { CanvasFlow } from "./flow/CanvasFlow.js";
import type { CanvasPointerApi } from "./hooks/useCanvasPointerTracking.js";
import type {
  CanvasImageDropPosition,
  CanvasImageImportOptions,
} from "./hooks/useCanvasExternalImageDrop.js";
import type { CanvasCardContextMenuState } from "./context-menus/CanvasCardContextMenu.js";
import type { CanvasImageContextMenuState } from "./context-menus/CanvasImageContextMenu.js";
import type { CanvasStickyNoteContextMenuState } from "./context-menus/CanvasStickyNoteContextMenu.js";
import { CanvasEmptyState } from "./chrome/CanvasEmptyState.js";
import { CanvasHeader } from "./chrome/CanvasHeader.js";
import { CanvasCommandPalette } from "./chrome/CanvasCommandPalette.js";
import { StickyNoteNode } from "./sticky-note/StickyNoteNode.js";
import { StickyNoteToolbar } from "./toolbars/StickyNoteToolbar.js";
import { CanvasImageToolbar } from "./toolbars/CanvasImageToolbar.js";
import { CanvasToolbar, type CanvasTool } from "./chrome/CanvasToolbar.js";
import { CanvasViewToolbar } from "./chrome/CanvasViewToolbar.js";
import { BulkSelectionToolbar } from "./toolbars/BulkSelectionToolbar.js";
import { attachmentLabelFromPath } from "../../services/graph/attachmentLabel.js";
import { GlobalGraphView } from "./graph/GlobalGraphView.js";
import { TimelineWorkspace } from "./timeline/TimelineWorkspace.js";
import { WorldWizardPanel } from "./wizard/WorldWizardPanel.js";
import { useCanvasCommandPaletteShortcut } from "./hooks/useCanvasCommandPaletteShortcut.js";
import { useCanvasEditShortcuts } from "./hooks/useCanvasEditShortcuts.js";
import {
  useCanvasClipboard,
  type CanvasClipboardItem,
} from "../../services/canvas/canvasClipboard.js";
import { useCanvasHistory } from "./hooks/useCanvasHistory.js";
import { useCanvasVaultLoader } from "./hooks/useCanvasVaultLoader.js";
import {
  CANVAS_PASTE_OFFSET_PX,
  isSelectableCanvasNode,
  linksRecord,
  selectedCardIdsFromNodes,
  selectedImageIdsFromNodes,
  worldNameFromPath,
} from "./helpers/canvasSelectionHelpers.js";
import {
  isValidEasyConnection,
  normalizeConnection,
} from "../../services/links/resolveEasyConnect.js";
import { copyCardToWorld } from "../../services/library/copyCardToWorld.js";
import { listWorlds } from "../../services/worlds/listWorlds.js";
import { isModuleEnabled } from "../../services/modules/isModuleEnabled.js";
import { applyFamilyTreeKinshipSocketVisibility } from "../../services/settings/visibleSocketSettings.js";
import {
  buildFamilyGraph,
  characterCardsFromRecord,
} from "../../services/familyTree/buildFamilyGraph.js";
import { computeRelationsToAnchor } from "../../services/familyTree/computeRelationsToAnchor.js";
import { createFamilyCardFromCharacter } from "../../services/familyTree/createFamilyCardFromCharacter.js";
import {
  familyCardsWithAnchor,
  findFamilyCardByAnchor,
} from "../../services/familyTree/familyCardAnchor.js";
import { familyTreeNodeStateForCard } from "../../services/familyTree/familyTreeNodeState.js";
import { syncFamilyCardMembers } from "../../services/familyTree/syncFamilyCardMembers.js";
import { normalizeFamilyTreeUnrelatedMode } from "../../services/settings/familyTreeSettings.js";
import { normalizeTimelineEraSuffix } from "../../services/settings/timelineSettings.js";

const nodeTypes = {
  worldnoteCard: CardNode,
  worldnoteImage: ImageNode,
  worldnoteNote: StickyNoteNode,
};

const edgeTypes: EdgeTypes = {
  link: LinkEdge,
};

type CanvasProps = {
  onBack: () => void;
  onOpenVault?: () => void;
  onOpenSettings?: () => void;
};

type CharacterCard = Extract<WorldCard, { card_type: "character" }>;

export function Canvas({ onBack, onOpenVault, onOpenSettings }: CanvasProps) {
  const vaultPath = useVault((state) => state.currentVaultPath);
  const storedWorldName = useVault((state) => state.currentWorldName);
  const worldnoteRoot = useSettings((state) => state.settings?.worldnoteRoot);
  const rawVisibleSocketsSettings = useSettings(
    (state) => state.settings?.visibleSockets,
  );
  const cardTypeBadgeColors = useSettings(
    (state) => state.settings?.cardTypeBadgeColors,
  );
  const kinshipLabelColors = useSettings(
    (state) => state.settings?.kinshipLabelColors,
  );
  const canvasShortcuts = useSettings(
    (state) => state.settings?.canvasShortcuts,
  );
  const appSettings = useSettings((state) => state.settings);
  const visibleSocketsSettings = useMemo(
    () =>
      applyFamilyTreeKinshipSocketVisibility(
        rawVisibleSocketsSettings,
        isModuleEnabled(appSettings, "familyTree"),
      ),
    [appSettings, rawVisibleSocketsSettings],
  );
  const setCanvasClipboard = useCanvasClipboard((state) => state.setClipboard);
  const nextPasteGeneration = useCanvasClipboard(
    (state) => state.nextPasteGeneration,
  );
  const [resolvedWorldName, setResolvedWorldName] = useState<string | null>(
    null,
  );
  const { listCards, upsertCard, loadCanvasManifest } = useCardCommands();
  const {
    listEras,
    upsertEra,
    listPeriods,
    upsertPeriod,
    loadCalendarConfig,
  } = useTimelineCommands();
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasFlowNode>([]);
  const [activeTool, setActiveTool] = useState<CanvasTool>("select");
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [cardsById, setCardsById] = useState<Record<string, WorldCard>>({});
  const [linksById, setLinksById] = useState<Record<string, Link>>({});
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [inspectorMode, setInspectorMode] = useState<InspectorMode>("read");
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isBulkTogglingView, setIsBulkTogglingView] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardSeedCardIds, setWizardSeedCardIds] = useState<string[] | null>(
    null,
  );
  const [isGraphViewOpen, setIsGraphViewOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [eras, setEras] = useState<Era[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [calendarConfig, setCalendarConfig] = useState<CalendarConfig>({
    suffix: "",
  });
  const [isVaultDataLoaded, setIsVaultDataLoaded] = useState(false);
  const pendingStarterAction = useVault((state) => state.pendingStarterAction);
  const clearStarterAction = useVault((state) => state.clearStarterAction);
  const [imageContextMenu, setImageContextMenu] =
    useState<CanvasImageContextMenuState | null>(null);
  const [cardContextMenu, setCardContextMenu] =
    useState<CanvasCardContextMenuState | null>(null);
  const [stickyNoteContextMenu, setStickyNoteContextMenu] =
    useState<CanvasStickyNoteContextMenuState | null>(null);

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const cardsByIdRef = useRef(cardsById);
  cardsByIdRef.current = cardsById;

  const linksByIdRef = useRef(linksById);
  linksByIdRef.current = linksById;

  const visibleSocketsSettingsRef = useRef(visibleSocketsSettings);
  visibleSocketsSettingsRef.current = visibleSocketsSettings;

  const cardTypeBadgeColorsRef = useRef(cardTypeBadgeColors);
  cardTypeBadgeColorsRef.current = cardTypeBadgeColors;

  const kinshipLabelColorsRef = useRef(kinshipLabelColors);
  kinshipLabelColorsRef.current = kinshipLabelColors;

  /** Ignores duplicate select changes from React Flow after we set selection in onNodeClick. */
  const ignoreSelectChangesFromClickRef = useRef(false);
  const handleSaveCardRef = useRef<
    (card: WorldCard, options?: { notify?: boolean }) => Promise<void>
  >(async () => {});

  const focusCardRef = useRef<((cardId: string) => void) | undefined>(
    undefined,
  );
  const lastCanvasPointerRef = useRef<CanvasFlowPointer | null>(null);
  const canvasPointerApiRef = useRef<CanvasPointerApi | null>(null);

  const {
    pushCanvasHistory,
    handleHistoryUndo,
    handleHistoryRedo,
    runWithoutHistoryPush,
    dragHistoryPushedRef,
  } = useCanvasHistory({
    vaultPath,
    nodesRef,
    cardsByIdRef,
    linksByIdRef,
    visibleSocketsSettingsRef,
    cardTypeBadgeColorsRef,
    kinshipLabelColorsRef,
    handleSaveCardRef,
    setNodes,
    setEdges,
    setCardsById,
    setLinksById,
    setSelectedCardIds,
    setSelectedImageIds,
    setSelectedLinkId,
    setImageContextMenu,
  });

  useEffect(() => {
    setNodes((nodeList) =>
      nodeList.map((node) => {
        if (node.type !== "worldnoteCard" || !node.data.cardType) {
          return node;
        }
        const badge = resolveCardBadgeStyle(
          node.data.cardType,
          cardTypeBadgeColors,
        );
        const kinshipBadge = resolveKinshipBadgeStyle(kinshipLabelColors);
        if (
          node.data.badgeClassName === badge.badgeClassName &&
          node.data.badgeTextColor === badge.badgeTextColor &&
          node.data.kinshipBadgeClassName === kinshipBadge.badgeClassName &&
          node.data.kinshipBadgeTextColor === kinshipBadge.badgeTextColor
        ) {
          return node;
        }
        return {
          ...node,
          data: {
            ...node.data,
            badgeClassName: badge.badgeClassName,
            badgeTextColor: badge.badgeTextColor,
            kinshipBadgeClassName: kinshipBadge.badgeClassName,
            kinshipBadgeTextColor: kinshipBadge.badgeTextColor,
          },
        };
      }),
    );
  }, [cardTypeBadgeColors, kinshipLabelColors, setNodes]);

  const handleNavigateToCard = useCallback(
    (cardId: string, options?: { focusOnCanvas?: boolean }) => {
      setSelectedCardIds([cardId]);
      setSelectedLinkId(null);
      setInspectorMode("read");
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === cardId,
        })),
      );
      if (options?.focusOnCanvas !== false) {
        focusCardRef.current?.(cardId);
      }
    },
    [setNodes],
  );

  const familyTreeAnchorId = useMemo(() => {
    if (!isModuleEnabled(appSettings, "familyTree")) {
      return null;
    }
    if (selectedCardIds.length !== 1) {
      return null;
    }
    const anchorId = selectedCardIds[0];
    if (!anchorId || cardsById[anchorId]?.card_type !== "character") {
      return null;
    }
    return anchorId;
  }, [appSettings, cardsById, selectedCardIds]);

  const familyGraph = useMemo(() => {
    const links = Object.values(linksById);
    return buildFamilyGraph(characterCardsFromRecord(cardsById), links);
  }, [cardsById, linksById]);

  const relationsByCardId = useMemo(() => {
    if (!familyTreeAnchorId) {
      return null;
    }
    return computeRelationsToAnchor(
      familyGraph,
      familyTreeAnchorId,
      cardsById,
    );
  }, [cardsById, familyGraph, familyTreeAnchorId]);

  const familyTreeEnabled = isModuleEnabled(appSettings, "familyTree");
  const timelineEnabled = isModuleEnabled(appSettings, "timeline");

  const anchoredFamilyCards = useMemo(
    () => (familyTreeEnabled ? familyCardsWithAnchor(cardsById) : []),
    [cardsById, familyTreeEnabled],
  );

  const familyTreeUnrelatedMode = normalizeFamilyTreeUnrelatedMode(
    appSettings?.familyTreeUnrelatedMode,
  );

  useEffect(() => {
    const familyTreeActive = Boolean(familyTreeAnchorId && relationsByCardId);
    const kinshipBadge = resolveKinshipBadgeStyle(kinshipLabelColors);

    setNodes((prev) => {
      let changed = false;
      const next = prev.map((node) => {
        if (node.type !== "worldnoteCard") {
          return node;
        }

        const card = cardsByIdRef.current[node.id];
        if (!card) {
          return node;
        }

        let hidden = false;
        let dimmed = false;
        let kinshipLabel: string | undefined;

        if (familyTreeActive && card.card_type === "character") {
          const treeState = familyTreeNodeStateForCard(
            card,
            familyTreeAnchorId,
            relationsByCardId,
            familyTreeUnrelatedMode,
          );
          if (treeState) {
            hidden = treeState.hidden;
            dimmed = treeState.dimmed ?? false;
            kinshipLabel = treeState.kinshipLabel;
          }
        }

        const currentHidden = node.hidden ?? false;
        const currentDimmed = node.data.dimmed ?? false;
        const currentLabel =
          "kinshipLabel" in node.data
            ? node.data.kinshipLabel
            : undefined;
        const currentKinshipBg = node.data.kinshipBadgeClassName;
        const currentKinshipText = node.data.kinshipBadgeTextColor;

        if (
          currentHidden === hidden &&
          currentDimmed === dimmed &&
          currentLabel === kinshipLabel &&
          currentKinshipBg === kinshipBadge.badgeClassName &&
          currentKinshipText === kinshipBadge.badgeTextColor
        ) {
          return node;
        }

        changed = true;
        return {
          ...node,
          hidden,
          data: {
            ...node.data,
            kinshipLabel,
            dimmed: dimmed || undefined,
            kinshipBadgeClassName: kinshipBadge.badgeClassName,
            kinshipBadgeTextColor: kinshipBadge.badgeTextColor,
          },
        };
      });

      return changed ? next : prev;
    });
  }, [
    familyTreeAnchorId,
    familyTreeUnrelatedMode,
    kinshipLabelColors,
    relationsByCardId,
    setNodes,
  ]);

  const placeFamilyCardOnCanvas = useCallback(
    (
      familyCard: FamilyCard,
      links: Link[],
      options?: { select?: boolean; focus?: boolean },
    ) => {
      if (!vaultPath) {
        return;
      }

      const nextCardsById = {
        ...cardsByIdRef.current,
        [familyCard.id]: familyCard,
      };
      setCardsById(nextCardsById);
      setLinksById(linksRecord(links));
      setEdges(links.map(linkToEdge));

      setNodes((prev) => {
        const exists = prev.some((node) => node.id === familyCard.id);
        const nodeData = worldCardToNodeData(familyCard, vaultPath, {
          visibleSocketsSettings,
          cardTypeBadgeColors,
          kinshipLabelColors,
          links,
          cardsById: nextCardsById,
          ...cardNodeSaveCallbacks(familyCard, (nextCard, saveOptions) =>
            handleSaveCardRef.current(nextCard, saveOptions),
          ),
        });

        if (exists) {
          return prev.map((node) => {
            if (node.id !== familyCard.id) {
              return { ...node, selected: false };
            }
            if (node.type !== "worldnoteCard") {
              return node;
            }
            return {
              ...node,
              position: familyCard.position,
              selected: options?.select ?? false,
              data: nodeData,
            };
          });
        }

        const newNode: CardFlowNode = {
          id: familyCard.id,
          type: "worldnoteCard",
          position: familyCard.position,
          selected: options?.select ?? true,
          data: {
            ...nodeData,
            enterAnimation: true,
          },
        };

        return [...prev.map((node) => ({ ...node, selected: false })), newNode];
      });

      if (options?.select) {
        setSelectedCardIds([familyCard.id]);
        setSelectedLinkId(null);
        setInspectorMode("edit");
      }
      if (options?.focus) {
        focusCardRef.current?.(familyCard.id);
      }
    },
    [
      cardTypeBadgeColors,
      kinshipLabelColors,
      setEdges,
      setNodes,
      vaultPath,
      visibleSocketsSettings,
    ],
  );

  useEffect(() => {
    if (!vaultPath || !isVaultDataLoaded || !familyTreeEnabled) {
      return;
    }
    if (anchoredFamilyCards.length === 0) {
      return;
    }

    let cancelled = false;

    void (async () => {
      let latestLinks = Object.values(linksByIdRef.current);
      let anyChanged = false;

      for (const familyCard of anchoredFamilyCards) {
        const result = await syncFamilyCardMembers({
          vault: vaultPath,
          familyCard,
          graph: familyGraph,
          links: latestLinks,
          cardsById: cardsByIdRef.current,
        });
        if (cancelled) {
          return;
        }
        if (result.changed) {
          anyChanged = true;
          latestLinks = result.links;
        }
      }

      if (anyChanged && !cancelled) {
        setLinksById(linksRecord(latestLinks));
        setEdges(latestLinks.map(linkToEdge));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    anchoredFamilyCards,
    familyGraph,
    familyTreeEnabled,
    isVaultDataLoaded,
    setEdges,
    vaultPath,
  ]);

  const syncSelectionFromNodes = useCallback((nodeList: CanvasFlowNode[]) => {
    const cardIds = selectedCardIdsFromNodes(
      nodeList,
      cardsByIdRef.current,
    );
    const imageIds = selectedImageIdsFromNodes(nodeList);
    setSelectedCardIds((prev) => {
      if (
        prev.length === cardIds.length &&
        prev.every((id, index) => id === cardIds[index])
      ) {
        return prev;
      }
      return cardIds;
    });
    setSelectedImageIds((prev) => {
      if (
        prev.length === imageIds.length &&
        prev.every((id, index) => id === imageIds[index])
      ) {
        return prev;
      }
      return imageIds;
    });
    if (cardIds.length > 0) {
      setSelectedLinkId(null);
      setSelectedImageIds([]);
      if (cardIds.length === 1) {
        setInspectorMode("read");
      }
    } else if (imageIds.length > 0) {
      setSelectedLinkId(null);
      setSelectedCardIds([]);
    }
  }, []);

  const handleNodesChange: OnNodesChange<Node> = useCallback(
    (changes) => {
      const isSelectOnly = changes.every((change) => change.type === "select");
      if (ignoreSelectChangesFromClickRef.current && isSelectOnly) {
        return;
      }

      // cast: react-flow passes NodeChange<Node>[]; nodes are always CanvasFlowNode
      onNodesChange(changes as NodeChange<CanvasFlowNode>[]);
      if (changes.some((change) => change.type === "select")) {
        const nextNodes = applyNodeChanges(
          changes as NodeChange<CanvasFlowNode>[],
          nodesRef.current,
        );
        syncSelectionFromNodes(nextNodes);
      }
    },
    [onNodesChange, syncSelectionFromNodes],
  );

  const applyCanvasNodeSelection = useCallback(
    (
      nodeId: string,
      modifiers: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean },
      nodeType?: string,
    ) => {
      const isMultiSelect =
        modifiers.shiftKey || modifiers.metaKey || modifiers.ctrlKey;

      setImageContextMenu(null);
      setCardContextMenu(null);
      setStickyNoteContextMenu(null);

      ignoreSelectChangesFromClickRef.current = true;
      setNodes((prev) => {
        const next = isMultiSelect
          ? prev.map((entry) =>
              entry.id === nodeId
                ? { ...entry, selected: !entry.selected }
                : entry,
            )
          : prev.map((entry) => ({
              ...entry,
              selected: entry.id === nodeId,
            }));
        syncSelectionFromNodes(next);
        return next;
      });
      queueMicrotask(() => {
        ignoreSelectChangesFromClickRef.current = false;
      });

      if (
        !isMultiSelect &&
        nodeType === "worldnoteCard" &&
        cardsByIdRef.current[nodeId]
      ) {
        setSelectedLinkId(null);
        setInspectorMode("read");
      }
    },
    [syncSelectionFromNodes, setNodes],
  );

  useEffect(() => {
    applyCanvasCardSelectionRef.current = (cardId, modifiers) => {
      applyCanvasNodeSelection(cardId, modifiers, "worldnoteCard");
    };
    return () => {
      applyCanvasCardSelectionRef.current = null;
    };
  }, [applyCanvasNodeSelection]);

  const handleNodeClick = useCallback<NodeMouseHandler<Node>>(
    (event, node) => {
      if (!isSelectableCanvasNode(node, cardsByIdRef.current)) {
        return;
      }
      if (node.type === "worldnoteCard") {
        return;
      }
      applyCanvasNodeSelection(
        node.id,
        {
          shiftKey: event.shiftKey,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
        },
        node.type,
      );
    },
    [applyCanvasNodeSelection],
  );

  const handleSelectionChange = useCallback(
    ({
      nodes: selectedNodes,
      edges: selectedEdges,
    }: OnSelectionChangeParams) => {
      const noteIds = selectedNodes
        .filter((node) => node.type === "worldnoteNote")
        .map((node) => node.id);

      if (noteIds.length > 0) {
        setSelectedCardIds([]);
        setSelectedImageIds([]);
        setSelectedLinkId(null);
        setNodes((prev) =>
          prev.map((node) => {
            if (node.type !== "worldnoteNote") {
              return node;
            }
            const isSelected = noteIds.includes(node.id);
            const editing = node.data.editing ?? false;
            return {
              ...node,
              draggable: isSelected ? !editing : true,
              data: {
                ...node.data,
                ...(isSelected ? {} : { editing: false }),
              },
            };
          }),
        );
        return;
      }

      const selectedEdge = selectedEdges[0];
      if (selectedEdge) {
        setSelectedLinkId(selectedEdge.id);
        setSelectedCardIds([]);
        setSelectedImageIds([]);
        return;
      }

      const cardIds = selectedNodes
        .filter(
          (node) =>
            node.type === "worldnoteCard" &&
            cardsByIdRef.current[node.id] != null,
        )
        .map((node) => node.id);
      const imageIds = selectedNodes
        .filter((node) => node.type === "worldnoteImage")
        .map((node) => node.id);

      if (cardIds.length > 0) {
        setSelectedCardIds(cardIds);
        setSelectedImageIds([]);
        setSelectedLinkId(null);
        if (cardIds.length === 1) {
          setInspectorMode("read");
        }
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            selected: node.type === "worldnoteCard" && cardIds.includes(node.id),
          })),
        );
        return;
      }

      if (imageIds.length > 0) {
        setSelectedImageIds(imageIds);
        setSelectedCardIds([]);
        setSelectedLinkId(null);
        setNodes((prev) =>
          prev.map((node) => ({
            ...node,
            selected:
              node.type === "worldnoteImage" && imageIds.includes(node.id),
          })),
        );
        return;
      }

      if (selectedNodes.length === 0 && selectedEdges.length === 0) {
        setSelectedCardIds([]);
        setSelectedImageIds([]);
        setSelectedLinkId(null);
      }
    },
    [setNodes],
  );

  const updateCardPosition = useMemo(() => {
    if (!vaultPath) {
      return null;
    }
    return createCardPositionUpdater(vaultPath);
  }, [vaultPath]);

  const updateImagePosition = useMemo(() => {
    if (!vaultPath) {
      return null;
    }
    return createCanvasImagePositionUpdater(vaultPath);
  }, [vaultPath]);

  const updateStickyNotePosition = useMemo(() => {
    if (!vaultPath) {
      return null;
    }
    return createStickyNotePositionUpdater(vaultPath);
  }, [vaultPath]);

  const updateStickyNoteManifest = useMemo(() => {
    if (!vaultPath) {
      return null;
    }
    return createStickyNoteManifestUpdater(vaultPath);
  }, [vaultPath]);

  const updateStickyNoteMarkdown = useMemo(() => {
    if (!vaultPath) {
      return null;
    }
    return createStickyNoteMarkdownUpdater(vaultPath);
  }, [vaultPath]);

  const handleDeleteStickyNote = useCallback(
    async (noteId: string) => {
      if (!vaultPath) {
        return;
      }
      pushCanvasHistory();
      await deleteStickyNoteMarkdown(vaultPath, noteId);
      await removeCanvasManifestStickyNote(vaultPath, noteId);
      setNodes((prev) => prev.filter((node) => node.id !== noteId));
      setStickyNoteContextMenu((current) =>
        current?.noteId === noteId ? null : current,
      );
    },
    [pushCanvasHistory, setNodes, vaultPath],
  );

  const buildStickyNoteCallbacks = useCallback(
    (noteId: string): StickyNoteNodeCallbacks => ({
      onChange: (payload) => {
        setNodes((prev) =>
          prev.map((node) => {
            if (node.id !== noteId || node.type !== "worldnoteNote") {
              return node;
            }
            const updated: NoteFlowNode = {
              ...node,
              data: {
                ...node.data,
                content: payload.content,
              },
            };
            if (updateStickyNoteMarkdown) {
              void updateStickyNoteMarkdown(stickyNoteFromFlowNode(updated));
            }
            return updated;
          }),
        );
      },
      onChangeHeading: (heading) => {
        setNodes((prev) =>
          prev.map((node) => {
            if (node.id !== noteId || node.type !== "worldnoteNote") {
              return node;
            }
            const updated: NoteFlowNode = {
              ...node,
              data: { ...node.data, heading },
            };
            if (updateStickyNoteManifest) {
              void updateStickyNoteManifest(
                StickyNotePlacementSchema.parse(
                  stickyNotePlacementFromFlowNode(updated),
                ),
              );
            }
            if (updateStickyNoteMarkdown) {
              void updateStickyNoteMarkdown(stickyNoteFromFlowNode(updated));
            }
            return updated;
          }),
        );
      },
      onChangeColor: (color) => {
        setNodes((prev) =>
          prev.map((node) => {
            if (node.id !== noteId || node.type !== "worldnoteNote") {
              return node;
            }
            const updated: NoteFlowNode = {
              ...node,
              data: { ...node.data, color },
              className: stickyNoteSurfaceClass(color),
            };
            if (updateStickyNoteManifest) {
              void updateStickyNoteManifest(
                StickyNotePlacementSchema.parse(
                  stickyNotePlacementFromFlowNode(updated),
                ),
              );
            }
            return updated;
          }),
        );
      },
      onDelete: () => {
        void handleDeleteStickyNote(noteId);
      },
      onRequestEdit: () => {
        setNodes((prev) =>
          prev.map((node) => {
            if (node.type !== "worldnoteNote") {
              return node;
            }
            const isTarget = node.id === noteId;
            return {
              ...node,
              selected: isTarget,
              draggable: !isTarget,
              data: {
                ...node.data,
                editing: isTarget,
              },
            };
          }),
        );
        setSelectedCardIds([]);
        setSelectedImageIds([]);
        setSelectedLinkId(null);
      },
      onEndEdit: () => {
        setNodes((prev) =>
          prev.map((node) => {
            if (node.id !== noteId || node.type !== "worldnoteNote") {
              return node;
            }
            return {
              ...node,
              draggable: true,
              data: { ...node.data, editing: false },
            };
          }),
        );
      },
    }),
    [
      handleDeleteStickyNote,
      setNodes,
      updateStickyNoteManifest,
      updateStickyNoteMarkdown,
    ],
  );

  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.type !== "worldnoteNote") {
          return node;
        }
        return {
          ...node,
          data: {
            ...node.data,
            ...buildStickyNoteCallbacks(node.id),
          },
        };
      }),
    );
  }, [buildStickyNoteCallbacks, setNodes]);

  const handleSaveCard = useCallback(
    async (card: WorldCard, options?: { notify?: boolean }) => {
      if (!vaultPath) {
        return;
      }
      const node = nodesRef.current.find((entry) => entry.id === card.id);
      const cardWithPosition = node
        ? { ...card, position: node.position }
        : card;
      const saved = await updateWorldCard(vaultPath, cardWithPosition, options);
      setCardsById((prev) => ({ ...prev, [saved.id]: saved }));
    },
    [vaultPath],
  );

  const handleSaveEra = useCallback(
    async (era: Era) => {
      if (!vaultPath) {
        return;
      }
      const saved = await upsertEra(vaultPath, era);
      setEras((prev) => {
        const next = prev.filter((entry) => entry.id !== saved.id);
        return [...next, saved].sort(
          (left, right) =>
            left.start_year - right.start_year ||
            left.name.localeCompare(right.name),
        );
      });
    },
    [upsertEra, vaultPath],
  );

  const handleSavePeriod = useCallback(
    async (period: Period) => {
      if (!vaultPath) {
        return;
      }
      const saved = await upsertPeriod(vaultPath, period);
      setPeriods((prev) => {
        const next = prev.filter((entry) => entry.id !== saved.id);
        return [...next, saved].sort(
          (left, right) =>
            left.start_year - right.start_year ||
            left.name.localeCompare(right.name),
        );
      });
    },
    [upsertPeriod, vaultPath],
  );


  const toggleAllCardViews = useCallback(async () => {
    if (!vaultPath || isBulkTogglingView) {
      return;
    }

    const cards = Object.values(cardsByIdRef.current);
    if (cards.length === 0) {
      return;
    }

    const allNode = cards.every(
      (card) => card.custom_properties?.view_mode === "node",
    );
    const nextMode = allNode ? "visual" : "node";

    setIsBulkTogglingView(true);

    const updated = cards.map((card) => ({
      ...card,
      custom_properties: {
        ...(card.custom_properties ?? {}),
        view_mode: nextMode,
      },
    }));

    setCardsById((prev) => {
      const next = { ...prev };
      for (const card of updated) {
        next[card.id] = card;
      }
      return next;
    });

    try {
      await Promise.all(
        updated.map((card) =>
          updateWorldCard(vaultPath, card, { notify: false }),
        ),
      );
    } catch (error) {
      console.error("Failed to toggle card views:", error);
    } finally {
      setIsBulkTogglingView(false);
    }
  }, [isBulkTogglingView, vaultPath]);

  handleSaveCardRef.current = handleSaveCard;

  const applyNodeDataFromCards = useCallback(() => {
    if (!vaultPath) {
      return;
    }
    const cards = cardsByIdRef.current;
    const links = Object.values(linksById);
    setNodes((prev) =>
      prev.map((node) => {
        if (node.type !== "worldnoteCard") {
          return node;
        }
        const card = cards[node.id];
        if (!card) {
          return node;
        }
        return {
          ...node,
          data: worldCardToNodeData(card, vaultPath, {
            visibleSocketsSettings,
            cardTypeBadgeColors,
            kinshipLabelColors,
            links,
            cardsById: cards,
            ...cardNodeSaveCallbacks(card, (nextCard, options) =>
              handleSaveCardRef.current(nextCard, options),
            ),
          }),
        };
      }),
    );
  }, [
    cardTypeBadgeColors,
    kinshipLabelColors,
    linksById,
    setNodes,
    vaultPath,
    visibleSocketsSettings,
  ]);

  useEffect(() => {
    if (!vaultPath || Object.keys(cardsById).length === 0) {
      return;
    }
    applyNodeDataFromCards();
  }, [applyNodeDataFromCards, cardsById, vaultPath]);

  useCanvasVaultLoader({
    vaultPath,
    listCards,
    upsertCard,
    loadCanvasManifest,
    visibleSocketsSettingsRef,
    cardTypeBadgeColorsRef,
    kinshipLabelColorsRef,
    setNodes,
    setEdges,
    setCardsById,
    setLinksById,
    setSelectedCardIds,
    setSelectedImageIds,
    setSelectedLinkId,
    setIsVaultDataLoaded,
  });

  useEffect(() => {
    if (!timelineEnabled) {
      setIsTimelineOpen(false);
    }
  }, [timelineEnabled]);

  useEffect(() => {
    if (!vaultPath) {
      setEras([]);
      setPeriods([]);
      setCalendarConfig({ suffix: "" });
      return;
    }

    const appSuffix = normalizeTimelineEraSuffix(appSettings?.timelineEraSuffix);

    let disposed = false;
    void (async () => {
      try {
        const [nextEras, nextPeriods, nextCalendar] = await Promise.all([
          listEras(vaultPath),
          listPeriods(vaultPath),
          loadCalendarConfig(vaultPath),
        ]);
        if (!disposed) {
          setEras(nextEras);
          setPeriods(nextPeriods);
          setCalendarConfig({
            suffix: nextCalendar.suffix || appSuffix,
          });
        }
      } catch (error) {
        console.warn("Could not load timeline data:", error);
      }
    })();

    return () => {
      disposed = true;
    };
  }, [
    appSettings?.timelineEraSuffix,
    listEras,
    listPeriods,
    loadCalendarConfig,
    vaultPath,
  ]);

  const linksList = useMemo(() => Object.values(linksById), [linksById]);

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      if (!connection.source || !connection.target) {
        return false;
      }
      return isValidEasyConnection(connection, cardsById, linksList);
    },
    [cardsById, linksList],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!vaultPath) {
        return;
      }

      const normalized = normalizeConnection(connection, cardsById, linksList);
      if (!normalized?.targetHandle) {
        return;
      }

      const socketId = canonicalSocketId(normalized.targetHandle);
      if (!socketId) {
        return;
      }

      const sourceCard = cardsById[normalized.target];
      const targetCard = cardsById[normalized.source];
      if (!sourceCard || !targetCard) {
        return;
      }

      const tempId = crypto.randomUUID();
      const optimisticEdge: Edge = {
        id: tempId,
        source: normalized.source,
        target: normalized.target,
        targetHandle: socketId,
        type: "link",
        data: { sourceSocket: socketId },
      };

      setEdges((prev) => [...prev, optimisticEdge]);

      void createLink({
        vault: vaultPath,
        sourceCard,
        sourceSocket: socketId,
        targetCard,
      })
        .then((link) => {
          setLinksById((prev) => ({ ...prev, [link.id]: link }));
          setEdges((prev) =>
            prev.map((edge) => (edge.id === tempId ? linkToEdge(link) : edge)),
          );
          setSelectedLinkId(link.id);
          setSelectedCardIds([]);
        })
        .catch((error) => {
          console.error("Failed to create link:", error);
          setEdges((prev) => prev.filter((edge) => edge.id !== tempId));
        });
    },
    [cardsById, linksList, setEdges, vaultPath],
  );

  const addCard = useCallback(
    (
      cardType: NewCardType,
      position?: { x: number; y: number },
      spawnOptions?: { preferViewportCenter?: boolean },
    ) => {
      if (!vaultPath) {
        console.warn("Cannot create card: no vault selected");
        return Promise.resolve();
      }

      const nextPosition =
        position ??
        canvasPointerApiRef.current?.resolveSpawnPosition({
          preferViewportCenter: spawnOptions?.preferViewportCenter,
        }) ??
        ({ x: 0, y: 0 } satisfies CanvasFlowPointer);
      const tempId = crypto.randomUUID();
      const fallbackTitle = NEW_CARD_DEFAULT_NAMES[cardType];

      setNodes((prev) => [
        ...prev,
        {
          id: tempId,
          type: "worldnoteCard",
          position: nextPosition,
          data: {
            title: fallbackTitle,
            cardType,
            enterAnimation: true,
          },
        },
      ]);

      return createWorldCard({
        vault: vaultPath,
        cardType,
        position: nextPosition,
      })
        .then((card) => {
          setCardsById((prev) => ({ ...prev, [card.id]: card }));
          setNodes((prev) =>
            prev.map((node) =>
              node.id === tempId
                ? {
                    id: card.id,
                    type: "worldnoteCard",
                    position: card.position,
                    data: worldCardToNodeData(card, vaultPath, {
                      visibleSocketsSettings,
                      cardTypeBadgeColors,
                      kinshipLabelColors,
                      links: Object.values(linksById),
                      cardsById: { ...cardsById, [card.id]: card },
                    }),
                  }
                : node,
            ),
          );
          setSelectedCardIds([card.id]);
          setSelectedLinkId(null);
          setInspectorMode("edit");
          if (spawnOptions?.preferViewportCenter) {
            queueMicrotask(() => focusCardRef.current?.(card.id));
          }
        })
        .catch((error) => {
          console.error("Failed to persist card:", error);
          setNodes((prev) => prev.filter((node) => node.id !== tempId));
        });
    },
    [
      cardTypeBadgeColors,
      cardsById,
      kinshipLabelColors,
      linksById,
      setNodes,
      vaultPath,
      visibleSocketsSettings,
    ],
  );

  useEffect(() => {
    if (!isVaultDataLoaded || !pendingStarterAction) {
      return;
    }
    if (pendingStarterAction === "add-character") {
      clearStarterAction();
      void addCard("character", undefined, { preferViewportCenter: true });
      return;
    }
    if (pendingStarterAction === "add-location") {
      clearStarterAction();
      void addCard("location", undefined, { preferViewportCenter: true });
    }
  }, [
    addCard,
    clearStarterAction,
    isVaultDataLoaded,
    pendingStarterAction,
  ]);

  const addCanvasImage = useCallback(
    async (
      sourcePath: string,
      position?: { x: number; y: number },
      options?: CanvasImageImportOptions,
    ) => {
      if (!vaultPath) {
        return;
      }

      const imageId = options?.imageId ?? crypto.randomUUID();
      const nextPosition =
        position ??
        canvasPointerApiRef.current?.resolveSpawnPosition({
          anchorOffset: CANVAS_IMAGE_SPAWN_ANCHOR_OFFSET,
          preferViewportCenter: options?.preferViewportCenter,
        }) ??
        ({ x: 0, y: 0 } satisfies CanvasFlowPointer);

      try {
        const imagePath =
          options?.storedImagePath ??
          (await saveCanvasImage(vaultPath, imageId, sourcePath));
        const imageSrc = cardImageSrc(vaultPath, imagePath);
        if (!imageSrc) {
          throw new Error("Failed to resolve canvas image URL");
        }

        const natural = await loadImageNaturalSize(imageSrc);
        const size = natural
          ? canvasImageNodeStyleForNaturalSize(natural.width, natural.height)
          : canvasImageNodeStyle();

        const placement = {
          id: imageId,
          x: nextPosition.x,
          y: nextPosition.y,
          imagePath,
          width: size.width,
          height: size.height,
        };
        await updateCanvasManifestImage(vaultPath, placement);

        const flowNode = imagePlacementToFlowNode(placement, vaultPath, {
          selected: true,
          enterAnimation: true,
        });
        if (!flowNode) {
          throw new Error("Failed to resolve canvas image URL");
        }

        setNodes((prev) => [...prev, flowNode]);
        setSelectedImageIds([imageId]);
        setSelectedCardIds([]);
        setSelectedLinkId(null);
        if (options?.preferViewportCenter) {
          queueMicrotask(() => focusCardRef.current?.(imageId));
        }
      } catch (error) {
        console.error("Failed to add canvas image:", error);
      }
    },
    [setNodes, vaultPath],
  );

  const handleImportCanvasImage = useCallback(
    async (
      sourcePath: string,
      flowPosition: CanvasImageDropPosition,
      options?: CanvasImageImportOptions,
    ) => {
      await addCanvasImage(sourcePath, flowPosition, options);
    },
    [addCanvasImage],
  );

  const handleImageTool = useCallback(async () => {
    if (!vaultPath || !isTauriRuntime()) {
      return;
    }

    setActiveTool("image");
    try {
      const sourcePath = await pickCardImageFile();
      if (!sourcePath) {
        return;
      }
      await addCanvasImage(sourcePath, undefined, {
        preferViewportCenter: true,
      });
    } catch (error) {
      console.error("Image tool failed:", error);
    } finally {
      setActiveTool("select");
    }
  }, [addCanvasImage, vaultPath]);

  const addStickyNote = useCallback(
    async (options?: { preferViewportCenter?: boolean }) => {
      if (!vaultPath) {
        return;
      }

      const noteId = crypto.randomUUID();
      const nextPosition =
        canvasPointerApiRef.current?.resolveSpawnPosition({
          preferViewportCenter: options?.preferViewportCenter,
        }) ?? ({ x: 0, y: 0 } satisfies CanvasFlowPointer);

      const placement = StickyNotePlacementSchema.parse({
        id: noteId,
        x: nextPosition.x,
        y: nextPosition.y,
        color: DEFAULT_STICKY_NOTE_COLOR,
        width: 200,
        height: 200,
      });

      try {
        await writeStickyNoteMarkdown(
          vaultPath,
          noteId,
          serializeStickyNoteMarkdown(undefined, ""),
        );
        await updateCanvasManifestStickyNote(vaultPath, placement);
        const flowNode = stickyNotePlacementToFlowNode(
          placement,
          "",
          buildStickyNoteCallbacks(noteId),
          {
            selected: true,
            enterAnimation: true,
            editing: true,
            draggable: false,
          },
        );
        setNodes((prev) => [
          ...prev.map((node) => ({ ...node, selected: false })),
          flowNode,
        ]);
        setSelectedCardIds([]);
        setSelectedImageIds([]);
        setSelectedLinkId(null);
        if (options?.preferViewportCenter) {
          queueMicrotask(() => focusCardRef.current?.(noteId));
        }
      } catch (error) {
        console.error("Failed to add sticky note:", error);
      }
    },
    [buildStickyNoteCallbacks, setNodes, vaultPath],
  );

  const handleTextTool = useCallback(async () => {
    if (!vaultPath) {
      return;
    }
    setActiveTool("text");
    try {
      await addStickyNote({ preferViewportCenter: true });
    } catch (error) {
      console.error("Text tool failed:", error);
    } finally {
      setActiveTool("select");
    }
  }, [addStickyNote, vaultPath]);

  const handleDeleteImage = useCallback(
    async (imageId: string) => {
      if (!vaultPath) {
        return;
      }
      pushCanvasHistory();
      await deleteCanvasImage(vaultPath, imageId);
      setNodes((prev) => prev.filter((node) => node.id !== imageId));
      setSelectedImageIds((current) => current.filter((id) => id !== imageId));
      setImageContextMenu((current) =>
        current?.imageId === imageId ? null : current,
      );
    },
    [pushCanvasHistory, setNodes, vaultPath],
  );

  const imageDimensionsFromNode = useCallback((node: ImageFlowNode) => {
    const width = node.style?.width;
    const height = node.style?.height;
    return {
      width: typeof width === "number" ? width : undefined,
      height: typeof height === "number" ? height : undefined,
    };
  }, []);

  const handleImageResizeEnd = useCallback(
    (nodeId: string, size: { width: number; height: number }) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId && node.type === "worldnoteImage"
            ? {
                ...node,
                style: {
                  ...node.style,
                  width: size.width,
                  height: size.height,
                },
              }
            : node,
        ),
      );

      if (!updateImagePosition) {
        return;
      }
      const node = nodesRef.current.find(
        (entry): entry is ImageFlowNode =>
          entry.id === nodeId && entry.type === "worldnoteImage",
      );
      if (!node) {
        return;
      }
      void updateImagePosition(
        canvasImagePlacementFromFlowNode({
          ...node,
          style: {
            ...node.style,
            width: size.width,
            height: size.height,
          },
        }),
      );
    },
    [setNodes, updateImagePosition],
  );

  const applyCanvasImageTransform = useCallback(
    (
      imageId: string,
      transform: (position: CardImagePosition) => CardImagePosition,
    ) => {
      const node = nodesRef.current.find(
        (entry): entry is ImageFlowNode =>
          entry.id === imageId && entry.type === "worldnoteImage",
      );
      if (!node || !updateImagePosition) {
        return;
      }
      const imagePosition = transform(
        node.data.imagePosition ?? defaultCanvasImageNodePosition(),
      );
      const updatedNode = canvasImageNodeWithPosition(node, imagePosition);
      setNodes((prev) =>
        prev.map((entry) =>
          entry.id === imageId && entry.type === "worldnoteImage"
            ? updatedNode
            : entry,
        ),
      );
      void updateImagePosition(canvasImagePlacementFromFlowNode(updatedNode));
    },
    [setNodes, updateImagePosition],
  );

  const handleFlipCanvasImageHorizontal = useCallback(
    (imageId: string) => {
      applyCanvasImageTransform(imageId, flipCardImageHorizontal);
    },
    [applyCanvasImageTransform],
  );

  const handleFlipCanvasImageVertical = useCallback(
    (imageId: string) => {
      applyCanvasImageTransform(imageId, flipCardImageVertical);
    },
    [applyCanvasImageTransform],
  );

  const handleRotateCanvasImageClockwise = useCallback(
    (imageId: string) => {
      applyCanvasImageTransform(imageId, rotateCardImageClockwise);
    },
    [applyCanvasImageTransform],
  );

  const handleCanvasImagePositionChange = useCallback(
    (imageId: string, imagePosition: CardImagePosition) => {
      const node = nodesRef.current.find(
        (entry): entry is ImageFlowNode =>
          entry.id === imageId && entry.type === "worldnoteImage",
      );
      if (!node || !updateImagePosition) {
        return;
      }
      const updatedNode = canvasImageNodeWithPosition(node, imagePosition);
      setNodes((prev) =>
        prev.map((entry) =>
          entry.id === imageId && entry.type === "worldnoteImage"
            ? updatedNode
            : entry,
        ),
      );
      void updateImagePosition(canvasImagePlacementFromFlowNode(updatedNode));
    },
    [setNodes, updateImagePosition],
  );

  const handleStickyNoteResizeEnd = useCallback(
    (nodeId: string, size: { width: number; height: number }) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId && node.type === "worldnoteNote"
            ? {
                ...node,
                style: {
                  ...node.style,
                  width: size.width,
                  height: size.height,
                },
              }
            : node,
        ),
      );

      if (!updateStickyNoteManifest) {
        return;
      }
      const noteNode = nodesRef.current.find(
        (entry): entry is NoteFlowNode =>
          entry.id === nodeId && entry.type === "worldnoteNote",
      );
      if (!noteNode) {
        return;
      }
      const updated: NoteFlowNode = {
        ...noteNode,
        style: {
          ...noteNode.style,
          width: size.width,
          height: size.height,
        },
      };
      void updateStickyNoteManifest(
        StickyNotePlacementSchema.parse(
          stickyNotePlacementFromFlowNode(updated),
        ),
      );
    },
    [setNodes, updateStickyNoteManifest],
  );

  const handleDuplicateStickyNote = useCallback(
    async (noteId: string) => {
      if (!vaultPath) {
        return;
      }
      pushCanvasHistory();
      const node = nodesRef.current.find(
        (entry): entry is NoteFlowNode =>
          entry.id === noteId && entry.type === "worldnoteNote",
      );
      if (!node) {
        return;
      }

      const newId = crypto.randomUUID();
      const offset = 48;
      const source = stickyNotePlacementFromFlowNode(node);
      const placement = StickyNotePlacementSchema.parse({
        ...source,
        id: newId,
        x: source.x + offset,
        y: source.y + offset,
      });

      try {
        const markdown = serializeStickyNoteMarkdown(
          source.heading,
          node.data.content ?? "",
        );
        await writeStickyNoteMarkdown(vaultPath, newId, markdown);
        await updateCanvasManifestStickyNote(vaultPath, placement);
        const flowNode = stickyNotePlacementToFlowNode(
          placement,
          node.data.content ?? "",
          buildStickyNoteCallbacks(newId),
          { selected: true, enterAnimation: true, draggable: true },
        );
        setNodes((prev) => [
          ...prev.map((entry) => ({ ...entry, selected: false })),
          flowNode,
        ]);
        setSelectedCardIds([]);
        setSelectedImageIds([]);
        setSelectedLinkId(null);
      } catch (error) {
        console.error("Failed to duplicate sticky note:", error);
      }
    },
    [buildStickyNoteCallbacks, pushCanvasHistory, setNodes, vaultPath],
  );

  const handleStickyNoteContextCopy = useCallback(
    (noteId: string) => {
      if (!vaultPath) {
        return;
      }
      const node = nodesRef.current.find(
        (entry): entry is NoteFlowNode =>
          entry.id === noteId && entry.type === "worldnoteNote",
      );
      if (!node) {
        return;
      }
      const placement = stickyNotePlacementFromFlowNode(node);
      setCanvasClipboard({
        vaultPath,
        items: [
          {
            kind: "stickyNote",
            noteId,
            x: placement.x,
            y: placement.y,
            heading: placement.heading,
            color: placement.color,
            content: node.data.content,
            width: placement.width,
            height: placement.height,
          },
        ],
      });
    },
    [setCanvasClipboard, vaultPath],
  );

  const handleDuplicateCanvasImage = useCallback(
    async (imageId: string) => {
      if (!vaultPath) {
        return;
      }
      pushCanvasHistory();
      const node = nodesRef.current.find(
        (entry): entry is ImageFlowNode =>
          entry.id === imageId && entry.type === "worldnoteImage",
      );
      if (!node) {
        return;
      }

      const newId = crypto.randomUUID();
      const offset = 48;
      const sourceAbsolute = vaultAbsoluteImagePath(
        vaultPath,
        node.data.imagePath,
      );

      try {
        const newImagePath = await saveCanvasImage(
          vaultPath,
          newId,
          sourceAbsolute,
        );
        const placement = {
          ...canvasImagePlacementFromFlowNode(node),
          id: newId,
          x: node.position.x + offset,
          y: node.position.y + offset,
          imagePath: newImagePath,
        };
        await updateCanvasManifestImage(vaultPath, placement);

        const flowNode = imagePlacementToFlowNode(placement, vaultPath, {
          selected: true,
          enterAnimation: true,
        });
        if (!flowNode) {
          throw new Error("Failed to resolve duplicated canvas image URL");
        }

        setNodes((prev) => [
          ...prev.map((entry) => ({ ...entry, selected: false })),
          flowNode,
        ]);
        setSelectedImageIds([newId]);
        setSelectedCardIds([]);
        setSelectedLinkId(null);
      } catch (error) {
        console.error("Failed to duplicate canvas image:", error);
      }
    },
    [pushCanvasHistory, setNodes, vaultPath],
  );

  const cardIdsForContextAction = useCallback((cardId: string): string[] => {
    const selected = selectedCardIdsFromNodes(
      nodesRef.current,
      cardsByIdRef.current,
    );
    const base =
      selected.length > 1 && selected.includes(cardId) ? selected : [cardId];
    return expandCardIdsIncludingGroupMembers(base, cardsByIdRef.current);
  }, []);

  const openCardContextMenu = useCallback(
    (cardId: string, pointer: { clientX: number; clientY: number }) => {
      if (!cardsByIdRef.current[cardId]) {
        return;
      }

      setImageContextMenu(null);
      setStickyNoteContextMenu(null);
      setCardContextMenu({
        cardId,
        x: pointer.clientX,
        y: pointer.clientY,
        view: "actions",
      });
      const targetIds = cardIdsForContextAction(cardId);
      setNodes((prev) =>
        prev.map((entry) => ({
          ...entry,
          selected:
            entry.type === "worldnoteCard" && targetIds.includes(entry.id),
        })),
      );
      setSelectedCardIds(targetIds);
      setSelectedImageIds([]);
      setSelectedLinkId(null);
      if (targetIds.length === 1) {
        setInspectorMode("read");
      }
    },
    [cardIdsForContextAction, setNodes],
  );

  useEffect(() => {
    openCanvasCardContextMenuRef.current = openCardContextMenu;
    return () => {
      openCanvasCardContextMenuRef.current = null;
    };
  }, [openCardContextMenu]);

  const handleNodeContextMenu = useCallback(
    (event: MouseEvent, node: Node) => {
      event.preventDefault();
      setCardContextMenu(null);
      setStickyNoteContextMenu(null);

      if (node.type === "worldnoteCard") {
        openCardContextMenu(node.id, {
          clientX: event.clientX,
          clientY: event.clientY,
        });
        return;
      }

      if (node.type === "worldnoteNote") {
        setImageContextMenu(null);
        setStickyNoteContextMenu({
          noteId: node.id,
          x: event.clientX,
          y: event.clientY,
        });
        setNodes((prev) =>
          prev.map((entry) => ({
            ...entry,
            selected: entry.id === node.id,
          })),
        );
        setSelectedCardIds([]);
        setSelectedImageIds([]);
        setSelectedLinkId(null);
        return;
      }

      if (node.type !== "worldnoteImage") {
        return;
      }

      const currentImageIds = selectedImageIdsFromNodes(nodesRef.current);
      if (currentImageIds.length > 1 && currentImageIds.includes(node.id)) {
        setImageContextMenu(null);
        return;
      }

      setImageContextMenu({
        imageId: node.id,
        x: event.clientX,
        y: event.clientY,
      });
      setNodes((prev) =>
        prev.map((entry) => ({
          ...entry,
          selected: entry.id === node.id,
        })),
      );
      setSelectedImageIds([node.id]);
      setSelectedCardIds([]);
      setSelectedLinkId(null);
    },
    [openCardContextMenu, setNodes],
  );

  const handleSelectionContextMenu = useCallback(
    (event: MouseEvent, nodes: Node[]) => {
      event.preventDefault();
      const cardNode = nodes.find(
        (node) =>
          node.type === "worldnoteCard" && cardsByIdRef.current[node.id] != null,
      );
      if (!cardNode) {
        return;
      }
      openCardContextMenu(cardNode.id, {
        clientX: event.clientX,
        clientY: event.clientY,
      });
    },
    [openCardContextMenu],
  );

  const handleCardContextCopy = useCallback(
    (cardId: string) => {
      if (!vaultPath) {
        return;
      }
      const cardIds = cardIdsForContextAction(cardId);
      const items: CanvasClipboardItem[] = [];

      for (const id of cardIds) {
        const node = nodesRef.current.find(
          (entry): entry is CardFlowNode =>
            entry.id === id && entry.type === "worldnoteCard",
        );
        if (!node || !cardsByIdRef.current[id]) {
          continue;
        }
        items.push({
          kind: "card",
          cardId: id,
          x: node.position.x,
          y: node.position.y,
        });
      }

      if (items.length === 0) {
        return;
      }

      setCanvasClipboard({ vaultPath, items });
    },
    [cardIdsForContextAction, setCanvasClipboard, vaultPath],
  );

  const handleCardContextDuplicate = useCallback(
    async (cardId: string) => {
      if (!vaultPath) {
        return;
      }
      const cardIds = cardIdsForContextAction(cardId);
      pushCanvasHistory();

      const offset = { x: 48, y: 48 };
      const duplicateResult = await duplicateWorldCardsWithGroup(
        vaultPath,
        cardIds,
        cardsByIdRef.current,
        offset,
      );
      const duplicatedCards = duplicateResult.cards;
      const cardsOnCanvas = duplicatedCardsOnCanvas(duplicateResult);

      const links = Object.values(linksByIdRef.current);
      const nextCardsById = { ...cardsByIdRef.current };
      for (const card of duplicatedCards) {
        nextCardsById[card.id] = card;
      }
      setCardsById(nextCardsById);

      const newIds = duplicateResult.canvasCardIds;
      setNodes((prev) => [
        ...prev.map((node) => ({ ...node, selected: false })),
        ...cardsOnCanvas.map((card) => ({
          id: card.id,
          type: "worldnoteCard" as const,
          position: card.position,
          selected: true,
          data: worldCardToNodeData(card, vaultPath, {
            visibleSocketsSettings: visibleSocketsSettingsRef.current,
            cardTypeBadgeColors: cardTypeBadgeColorsRef.current,
            kinshipLabelColors: kinshipLabelColorsRef.current,
            links,
            cardsById: nextCardsById,
            ...cardNodeSaveCallbacks(card, (nextCard, options) =>
              handleSaveCardRef.current(nextCard, options),
            ),
          }),
        })),
      ]);
      setSelectedCardIds(newIds);
      setSelectedLinkId(null);
      setInspectorMode("read");
    },
    [cardIdsForContextAction, pushCanvasHistory, setNodes, vaultPath],
  );

  const handleCardChangeType = useCallback(
    async (cardId: string, newType: NewCardType) => {
      if (!vaultPath) {
        return;
      }
      const card = cardsByIdRef.current[cardId];
      if (!card || card.card_type === newType) {
        return;
      }

      pushCanvasHistory();
      const next = changeWorldCardType(card, newType);
      await handleSaveCard(next);
      setSelectedCardIds([cardId]);
      setSelectedImageIds([]);
      setSelectedLinkId(null);
      setInspectorMode("edit");
    },
    [handleSaveCard, pushCanvasHistory, vaultPath],
  );

  const handlePaneClick = useCallback(() => {
    setImageContextMenu(null);
    setCardContextMenu(null);
    setStickyNoteContextMenu(null);
    setNodes((prev) => {
      const next = prev.map((node) => {
        if (node.type === "worldnoteNote" && node.data.editing) {
          return {
            ...node,
            selected: false,
            draggable: true,
            data: { ...node.data, editing: false },
          };
        }
        return { ...node, selected: false };
      });
      syncSelectionFromNodes(next);
      return next;
    });
    setSelectedLinkId(null);
  }, [setNodes, syncSelectionFromNodes]);

  const removeCardFromCanvas = useCallback(
    async (cardId: string) => {
      if (!vaultPath) {
        return;
      }
      await deleteWorldCard(vaultPath, cardId);
      setCardsById((prev) => {
        const next = { ...prev };
        delete next[cardId];
        return next;
      });
      setLinksById((prev) => {
        const next = { ...prev };
        for (const [linkId, link] of Object.entries(prev)) {
          if (link.source_card === cardId || link.target_card === cardId) {
            delete next[linkId];
          }
        }
        return next;
      });
      setNodes((prev) => prev.filter((node) => node.id !== cardId));
      setEdges((prev) =>
        prev.filter((edge) => edge.source !== cardId && edge.target !== cardId),
      );
      setSelectedCardIds((current) => current.filter((id) => id !== cardId));
      setSelectedLinkId((current) => {
        const link = current ? linksById[current] : null;
        if (
          link &&
          (link.source_card === cardId || link.target_card === cardId)
        ) {
          return null;
        }
        return current;
      });
    },
    [linksById, setEdges, setNodes, vaultPath],
  );

  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      pushCanvasHistory();
      await removeCardFromCanvas(cardId);
    },
    [pushCanvasHistory, removeCardFromCanvas],
  );

  const handleSpawnCard = useCallback(
    async (card: WorldCard) => {
      if (!vaultPath) {
        return;
      }
      const position =
        canvasPointerApiRef.current?.resolveSpawnPosition({
          preferViewportCenter: true,
        }) ??
        ({ x: 0, y: 0 } satisfies CanvasFlowPointer);
      const placed = withCardPatch(card, { position });
      try {
        const saved = await updateWorldCard(vaultPath, placed);
        await updateCanvasManifestNode(vaultPath, {
          cardId: saved.id,
          x: position.x,
          y: position.y,
        });
        setCardsById((prev) => ({ ...prev, [saved.id]: saved }));
        setNodes((prev) => [
          ...prev,
          {
            id: saved.id,
            type: "worldnoteCard",
            position,
            data: {
              ...worldCardToNodeData(saved, vaultPath, {
                visibleSocketsSettings,
                cardTypeBadgeColors,
                kinshipLabelColors,
                links: Object.values(linksByIdRef.current),
                cardsById: { ...cardsByIdRef.current, [saved.id]: saved },
              }),
              enterAnimation: true,
            },
          },
        ]);
        setSelectedCardIds([saved.id]);
        setSelectedLinkId(null);
        queueMicrotask(() => focusCardRef.current?.(saved.id));
      } catch (error) {
        console.error("Failed to spawn generated card:", error);
      }
    },
    [
      cardTypeBadgeColors,
      kinshipLabelColors,
      setNodes,
      vaultPath,
      visibleSocketsSettings,
    ],
  );

  const handleDeleteLink = useCallback(
    async (linkId: string) => {
      if (!vaultPath) {
        return;
      }
      pushCanvasHistory();
      await deleteLink(vaultPath, linkId);
      setLinksById((prev) => {
        const next = { ...prev };
        delete next[linkId];
        return next;
      });
      setEdges((prev) => prev.filter((edge) => edge.id !== linkId));
      setSelectedLinkId((current) => (current === linkId ? null : current));
    },
    [pushCanvasHistory, setEdges, vaultPath],
  );

  const refreshLinksAndCanvas = useCallback(async () => {
    if (!vaultPath) {
      return;
    }
    const links = await listLinks(vaultPath);
    setLinksById(linksRecord(links));
    setEdges(links.map(linkToEdge));
    const cards = cardsByIdRef.current;
    setNodes((prev) =>
      prev.map((node) => {
        if (node.type !== "worldnoteCard") {
          return node;
        }
        const card = cards[node.id];
        if (!card) {
          return node;
        }
        return {
          ...node,
          data: worldCardToNodeData(card, vaultPath, {
            visibleSocketsSettings: visibleSocketsSettingsRef.current,
            cardTypeBadgeColors: cardTypeBadgeColorsRef.current,
            kinshipLabelColors: kinshipLabelColorsRef.current,
            links,
            cardsById: cards,
          }),
        };
      }),
    );
  }, [setEdges, setNodes, vaultPath]);

  const handleInspectorCreateSocketLink = useCallback(
    async (socketId: string, targetCardId: string) => {
      if (!vaultPath || selectedCardIds.length !== 1) {
        return;
      }
      const sourceCard = cardsByIdRef.current[selectedCardIds[0] ?? ""];
      const targetCard = cardsByIdRef.current[targetCardId];
      if (!sourceCard || !targetCard) {
        return;
      }
      pushCanvasHistory();
      try {
        await createLink({
          vault: vaultPath,
          sourceCard,
          sourceSocket: socketId,
          targetCard,
        });
        await refreshLinksAndCanvas();
      } catch (error) {
        console.error("Failed to create connection from inspector:", error);
      }
    },
    [pushCanvasHistory, refreshLinksAndCanvas, selectedCardIds, vaultPath],
  );

  const handleInspectorRemoveSocketLink = useCallback(
    async (linkId: string) => {
      if (!vaultPath) {
        return;
      }
      pushCanvasHistory();
      try {
        await deleteLink(vaultPath, linkId);
        await refreshLinksAndCanvas();
        setSelectedLinkId((current) => (current === linkId ? null : current));
      } catch (error) {
        console.error("Failed to remove connection from inspector:", error);
      }
    },
    [pushCanvasHistory, refreshLinksAndCanvas, vaultPath],
  );

  const handleInspectorCreateAndLinkCard = useCallback(
    async (
      socketId: string,
      cardType: WorldCard["card_type"],
      name: string,
    ) => {
      if (!vaultPath || selectedCardIds.length !== 1) {
        return;
      }
      const sourceCard = cardsByIdRef.current[selectedCardIds[0] ?? ""];
      if (!sourceCard) {
        return;
      }
      const sourceNode = nodesRef.current.find(
        (node): node is CardFlowNode =>
          node.id === sourceCard.id && node.type === "worldnoteCard",
      );
      const position = sourceNode
        ? { x: sourceNode.position.x + 120, y: sourceNode.position.y + 48 }
        : { ...sourceCard.position };

      if (!isNewCardType(cardType)) {
        return;
      }
      pushCanvasHistory();
      try {
        const newCard = await createWorldCard({
          vault: vaultPath,
          cardType,
          position,
          name: name.trim() || undefined,
        });
        const nextCardsById = {
          ...cardsByIdRef.current,
          [newCard.id]: newCard,
        };
        setCardsById(nextCardsById);
        const linksBefore = Object.values(linksByIdRef.current);
        setNodes((prev) => [
          ...prev,
          {
            id: newCard.id,
            type: "worldnoteCard" as const,
            position: newCard.position,
            data: worldCardToNodeData(newCard, vaultPath, {
              visibleSocketsSettings: visibleSocketsSettingsRef.current,
              cardTypeBadgeColors: cardTypeBadgeColorsRef.current,
            kinshipLabelColors: kinshipLabelColorsRef.current,
              links: linksBefore,
              cardsById: nextCardsById,
            }),
          },
        ]);
        await createLink({
          vault: vaultPath,
          sourceCard,
          sourceSocket: socketId,
          targetCard: newCard,
        });
        await refreshLinksAndCanvas();
      } catch (error) {
        console.error("Failed to create and link card from inspector:", error);
      }
    },
    [
      pushCanvasHistory,
      refreshLinksAndCanvas,
      selectedCardIds,
      setNodes,
      vaultPath,
    ],
  );

  const clearCardSelection = useCallback(() => {
    setSelectedCardIds([]);
    setSelectedImageIds([]);
    setNodes((nds) => nds.map((node) => ({ ...node, selected: false })));
  }, [setNodes]);

  const handleCardContextDelete = useCallback(
    async (cardId: string) => {
      const cardIds = cardIdsForContextAction(cardId);
      const message =
        cardIds.length > 1
          ? `Delete ${cardIds.length} cards?`
          : "Delete this card?";
      if (!window.confirm(message)) {
        return;
      }

      pushCanvasHistory();
      for (const id of cardIds) {
        await removeCardFromCanvas(id);
      }
      setCardContextMenu(null);
      clearCardSelection();
    },
    [
      cardIdsForContextAction,
      clearCardSelection,
      pushCanvasHistory,
      removeCardFromCanvas,
    ],
  );

  const handleCloseWizard = useCallback(() => {
    setIsWizardOpen(false);
    setWizardSeedCardIds(null);
  }, []);

  const handleOpenWizardWithCards = useCallback((cardIds: string[]) => {
    const validIds = cardIds.filter((id) => cardsByIdRef.current[id] != null);
    if (validIds.length === 0) {
      return;
    }
    setWizardSeedCardIds(validIds);
    setIsWizardOpen(true);
    setCardContextMenu(null);
  }, []);

  const handleDeleteSelectedCards = useCallback(async () => {
    const ids = [...selectedCardIds];
    for (const cardId of ids) {
      await handleDeleteCard(cardId);
    }
    clearCardSelection();
  }, [clearCardSelection, handleDeleteCard, selectedCardIds]);

  const handleDeleteSelectedImages = useCallback(async () => {
    const ids = [...selectedImageIds];
    for (const imageId of ids) {
      await handleDeleteImage(imageId);
    }
    setSelectedImageIds([]);
    setImageContextMenu(null);
  }, [handleDeleteImage, selectedImageIds]);

  const handleDuplicateSelectedImages = useCallback(async () => {
    if (!vaultPath || selectedImageIds.length === 0) {
      return;
    }

    const offset = 48;
    const duplicatedNodes: ImageFlowNode[] = [];
    const newIds: string[] = [];

    try {
      for (const imageId of selectedImageIds) {
        const node = nodesRef.current.find(
          (entry): entry is ImageFlowNode =>
            entry.id === imageId && entry.type === "worldnoteImage",
        );
        if (!node) {
          continue;
        }

        const newId = crypto.randomUUID();
        const sourceAbsolute = vaultAbsoluteImagePath(
          vaultPath,
          node.data.imagePath,
        );
        const newImagePath = await saveCanvasImage(
          vaultPath,
          newId,
          sourceAbsolute,
        );
        const placement = {
          ...canvasImagePlacementFromFlowNode(node),
          id: newId,
          x: node.position.x + offset,
          y: node.position.y + offset,
          imagePath: newImagePath,
        };
        await updateCanvasManifestImage(vaultPath, placement);

        const flowNode = imagePlacementToFlowNode(placement, vaultPath, {
          selected: true,
          enterAnimation: true,
        });
        if (!flowNode) {
          throw new Error("Failed to resolve duplicated canvas image URL");
        }
        duplicatedNodes.push(flowNode);
        newIds.push(newId);
      }

      if (duplicatedNodes.length === 0) {
        return;
      }

      setNodes((prev) => [
        ...prev.map((entry) => ({ ...entry, selected: false })),
        ...duplicatedNodes,
      ]);
      setSelectedImageIds(newIds);
      setSelectedCardIds([]);
      setSelectedLinkId(null);
      setImageContextMenu(null);
    } catch (error) {
      console.error("Failed to duplicate canvas images:", error);
    }
  }, [selectedImageIds, setNodes, vaultPath]);

  const handleDuplicateSelectedCards = useCallback(async () => {
    if (!vaultPath || selectedCardIds.length === 0) {
      return;
    }

    const offset = { x: 48, y: 48 };
    const duplicateResult = await duplicateWorldCardsWithGroup(
      vaultPath,
      selectedCardIds,
      cardsByIdRef.current,
      offset,
    );
    const duplicatedCards = duplicateResult.cards;
    const cardsOnCanvas = duplicatedCardsOnCanvas(duplicateResult);

    const links = Object.values(linksById);
    const nextCardsById = { ...cardsByIdRef.current };
    for (const card of duplicatedCards) {
      nextCardsById[card.id] = card;
    }
    setCardsById(nextCardsById);

    const newIds = duplicateResult.canvasCardIds;
    setNodes((prev) => [
      ...prev.map((node) => ({ ...node, selected: false })),
      ...cardsOnCanvas.map((card) => ({
        id: card.id,
        type: "worldnoteCard" as const,
        position: card.position,
        selected: true,
        data: worldCardToNodeData(card, vaultPath, {
          visibleSocketsSettings,
          cardTypeBadgeColors,
          kinshipLabelColors,
          links,
          cardsById: nextCardsById,
          ...cardNodeSaveCallbacks(card, (nextCard, options) =>
            handleSaveCardRef.current(nextCard, options),
          ),
        }),
      })),
    ]);
    setSelectedCardIds(newIds);
    setSelectedLinkId(null);
    setInspectorMode("read");
  }, [
    cardTypeBadgeColors,
    kinshipLabelColors,
    linksById,
    selectedCardIds,
    setNodes,
    vaultPath,
    visibleSocketsSettings,
  ]);

  const handleDuplicateSelection = useCallback(async () => {
    pushCanvasHistory();
    if (selectedCardIds.length > 0) {
      await handleDuplicateSelectedCards();
    }
    if (selectedImageIds.length > 0) {
      await handleDuplicateSelectedImages();
    }
  }, [
    pushCanvasHistory,
    handleDuplicateSelectedCards,
    handleDuplicateSelectedImages,
    selectedCardIds.length,
    selectedImageIds.length,
  ]);

  const handleCreateFamilyFromCharacters = useCallback(
    async (
      members: CharacterCard[],
      options?: { position?: { x: number; y: number } },
    ) => {
      if (!vaultPath || members.length === 0) {
        return;
      }

      const anchor = members[0];

      pushCanvasHistory();

      try {
        const result = await createFamilyCardFromCharacter({
          vault: vaultPath,
          anchorCharacter: anchor,
          graph: familyGraph,
          links: Object.values(linksByIdRef.current),
          cardsById: cardsByIdRef.current,
          position: options?.position,
          extraAnchorIds: members
            .filter((card) => card.id !== anchor.id)
            .map((card) => card.id),
        });

        placeFamilyCardOnCanvas(result.familyCard, result.links, {
          select: true,
          focus: true,
        });
      } catch (error) {
        console.error("Failed to create family card:", error);
      }
    },
    [familyGraph, placeFamilyCardOnCanvas, pushCanvasHistory, vaultPath],
  );

  const handleCreateFamilyFromSelection = useCallback(async () => {
    if (!familyTreeEnabled) {
      return;
    }

    const members = selectedCardIds
      .map((cardId) => {
        const card = cardsByIdRef.current[cardId];
        if (!card || card.card_type !== "character") {
          return null;
        }
        const node = nodesRef.current.find(
          (entry): entry is CardFlowNode =>
            entry.id === cardId && entry.type === "worldnoteCard",
        );
        return node ? { ...card, position: node.position } : card;
      })
      .filter((card): card is CharacterCard => card != null);

    if (members.length === 0) {
      return;
    }

    const position =
      members.length > 1 ? centerPositionForGroup(members) : undefined;
    await handleCreateFamilyFromCharacters(members, { position });
  }, [familyTreeEnabled, handleCreateFamilyFromCharacters, selectedCardIds]);

  const handleGroupSelectedCards = useCallback(async () => {
    if (!vaultPath || selectedCardIds.length < 2) {
      return;
    }

    const members = selectedCardIds
      .map((cardId) => {
        const card = cardsByIdRef.current[cardId];
        if (!card) {
          return null;
        }
        const node = nodesRef.current.find(
          (entry): entry is CardFlowNode =>
            entry.id === cardId && entry.type === "worldnoteCard",
        );
        return node ? { ...card, position: node.position } : card;
      })
      .filter((card): card is WorldCard => card != null);

    if (members.length < 2) {
      return;
    }

    if (
      familyTreeEnabled &&
      members.every((card) => card.card_type === "character")
    ) {
      await handleCreateFamilyFromCharacters(
        members.filter(
          (card): card is CharacterCard => card.card_type === "character",
        ),
        {
          position: centerPositionForGroup(members),
        },
      );
      return;
    }

    pushCanvasHistory();

    try {
      const { group, members: updatedMembers } = await groupSelectedWorldCards({
        vault: vaultPath,
        members,
      });

      const links = Object.values(linksById);
      const nextCardsById = { ...cardsByIdRef.current, [group.id]: group };
      for (const card of updatedMembers) {
        nextCardsById[card.id] = card;
      }
      setCardsById(nextCardsById);

      setNodes((prev) => [
        ...prev.map((node) => ({ ...node, selected: false })),
        {
          id: group.id,
          type: "worldnoteCard" as const,
          position: group.position,
          selected: true,
          data: worldCardToNodeData(group, vaultPath, {
            visibleSocketsSettings,
            cardTypeBadgeColors,
            kinshipLabelColors,
            links,
            cardsById: nextCardsById,
            ...cardNodeSaveCallbacks(group, (nextCard, options) =>
              handleSaveCardRef.current(nextCard, options),
            ),
          }),
        },
      ]);
      setSelectedCardIds([group.id]);
      setSelectedLinkId(null);
      setInspectorMode("edit");
    } catch (error) {
      console.error("Failed to create group from selection:", error);
    }
  }, [
    cardTypeBadgeColors,
    familyTreeEnabled,
    handleCreateFamilyFromCharacters,
    kinshipLabelColors,
    linksById,
    pushCanvasHistory,
    selectedCardIds,
    setNodes,
    vaultPath,
    visibleSocketsSettings,
  ]);

  const familyAnchorIdForAction = useMemo(() => {
    if (familyTreeAnchorId) {
      return familyTreeAnchorId;
    }
    for (const cardId of selectedCardIds) {
      if (cardsById[cardId]?.card_type === "character") {
        return cardId;
      }
    }
    return null;
  }, [cardsById, familyTreeAnchorId, selectedCardIds]);

  const createFamilyCardLabel = useMemo(() => {
    if (
      !familyAnchorIdForAction ||
      !findFamilyCardByAnchor(cardsById, familyAnchorIdForAction)
    ) {
      return "Create family card";
    }
    return "Open family card";
  }, [cardsById, familyAnchorIdForAction]);

  const canCreateFamilyFromSelection = useMemo(() => {
    if (!familyTreeEnabled || selectedCardIds.length === 0) {
      return false;
    }
    return selectedCardIds.every(
      (cardId) => cardsById[cardId]?.card_type === "character",
    );
  }, [cardsById, familyTreeEnabled, selectedCardIds]);

  const handleCopySelection = useCallback(() => {
    if (!vaultPath) {
      return;
    }

    const items: CanvasClipboardItem[] = [];
    const cardIdsToCopy = expandCardIdsIncludingGroupMembers(
      selectedCardIds,
      cardsByIdRef.current,
    );

    for (const cardId of cardIdsToCopy) {
      const node = nodesRef.current.find(
        (entry): entry is CardFlowNode =>
          entry.id === cardId && entry.type === "worldnoteCard",
      );
      if (!node || !cardsByIdRef.current[cardId]) {
        continue;
      }
      items.push({
        kind: "card",
        cardId,
        x: node.position.x,
        y: node.position.y,
      });
    }

    for (const imageId of selectedImageIds) {
      const node = nodesRef.current.find(
        (entry): entry is ImageFlowNode =>
          entry.id === imageId && entry.type === "worldnoteImage",
      );
      if (!node?.data.imagePath) {
        continue;
      }
      items.push({
        kind: "image",
        imageId,
        x: node.position.x,
        y: node.position.y,
        imagePath: node.data.imagePath,
        width:
          typeof node.style?.width === "number" ? node.style.width : undefined,
        height:
          typeof node.style?.height === "number"
            ? node.style.height
            : undefined,
        imagePosition: node.data.imagePosition,
      });
    }

    for (const node of nodesRef.current) {
      if (node.type !== "worldnoteNote" || !node.selected) {
        continue;
      }
      const placement = stickyNotePlacementFromFlowNode(node);
      items.push({
        kind: "stickyNote",
        noteId: node.id,
        x: placement.x,
        y: placement.y,
        heading: placement.heading,
        color: placement.color,
        content: node.data.content,
        width: placement.width,
        height: placement.height,
      });
    }

    if (items.length === 0) {
      return;
    }

    setCanvasClipboard({ vaultPath, items });
  }, [selectedCardIds, selectedImageIds, setCanvasClipboard, vaultPath]);

  const handlePasteFromClipboard = useCallback(async () => {
    const clipboard = useCanvasClipboard.getState();
    if (
      !vaultPath ||
      !clipboard.vaultPath ||
      clipboard.vaultPath !== vaultPath ||
      clipboard.items.length === 0
    ) {
      return;
    }

    pushCanvasHistory();

    const firstItem = clipboard.items[0];
    const pasteGeneration = nextPasteGeneration();
    const spawnBase =
      canvasPointerApiRef.current?.resolveSpawnPosition() ??
      ({ x: 0, y: 0 } satisfies CanvasFlowPointer);
    let pasteOffset = firstItem
      ? { x: spawnBase.x - firstItem.x, y: spawnBase.y - firstItem.y }
      : { x: 0, y: 0 };
    if (pasteGeneration > 0) {
      const nudge = pasteGeneration * CANVAS_PASTE_OFFSET_PX;
      pasteOffset = {
        x: pasteOffset.x + nudge,
        y: pasteOffset.y + nudge,
      };
    }

    const pastedCardIds: string[] = [];
    const pastedImageIds: string[] = [];
    const duplicatedCards: WorldCard[] = [];
    const duplicatedImageNodes: ImageFlowNode[] = [];
    const duplicatedNoteNodes: NoteFlowNode[] = [];
    const clipboardCardIds = clipboard.items
      .filter((item): item is Extract<CanvasClipboardItem, { kind: "card" }> => {
        return item.kind === "card";
      })
      .map((item) => item.cardId)
      .filter((cardId) => Boolean(cardsByIdRef.current[cardId]));

    try {
      if (clipboardCardIds.length > 0) {
        const pasteResult = await duplicateWorldCardsWithGroup(
          vaultPath,
          clipboardCardIds,
          cardsByIdRef.current,
          pasteOffset,
        );
        duplicatedCards.push(...pasteResult.cards);
        pastedCardIds.push(...pasteResult.canvasCardIds);
      }

      for (const item of clipboard.items) {
        if (item.kind === "card") {
          continue;
        }

        if (item.kind === "stickyNote") {
          const newId = crypto.randomUUID();
          const placement = StickyNotePlacementSchema.parse({
            id: newId,
            x: item.x + pasteOffset.x,
            y: item.y + pasteOffset.y,
            heading: item.heading,
            color: item.color,
            width: item.width,
            height: item.height,
          });
          const content = item.content ?? "";
          await writeStickyNoteMarkdown(
            vaultPath,
            newId,
            serializeStickyNoteMarkdown(item.heading, content),
          );
          await updateCanvasManifestStickyNote(vaultPath, placement);
          duplicatedNoteNodes.push(
            stickyNotePlacementToFlowNode(
              placement,
              content,
              buildStickyNoteCallbacks(newId),
              { selected: true, enterAnimation: true, draggable: true },
            ),
          );
          continue;
        }

        const sourceAbsolute = vaultAbsoluteImagePath(
          vaultPath,
          item.imagePath,
        );
        const newId = crypto.randomUUID();
        const newImagePath = await saveCanvasImage(
          vaultPath,
          newId,
          sourceAbsolute,
        );
        const placement = {
          id: newId,
          x: item.x + pasteOffset.x,
          y: item.y + pasteOffset.y,
          imagePath: newImagePath,
          width: item.width,
          height: item.height,
          imagePosition: item.imagePosition,
        };
        await updateCanvasManifestImage(vaultPath, placement);
        const flowNode = imagePlacementToFlowNode(placement, vaultPath, {
          selected: true,
          enterAnimation: true,
        });
        if (!flowNode) {
          throw new Error("Failed to resolve pasted canvas image URL");
        }
        duplicatedImageNodes.push(flowNode);
        pastedImageIds.push(newId);
      }

      if (
        duplicatedCards.length === 0 &&
        duplicatedImageNodes.length === 0 &&
        duplicatedNoteNodes.length === 0
      ) {
        return;
      }

      const links = Object.values(linksByIdRef.current);
      const nextCardsById = { ...cardsByIdRef.current };
      for (const card of duplicatedCards) {
        nextCardsById[card.id] = card;
      }
      setCardsById(nextCardsById);

      const pastedCanvasIdSet = new Set(pastedCardIds);
      const cardsToPlaceOnCanvas = duplicatedCards.filter((card) =>
        pastedCanvasIdSet.has(card.id),
      );

      setNodes((prev) => [
        ...prev.map((node) => ({ ...node, selected: false })),
        ...cardsToPlaceOnCanvas.map((card) => ({
          id: card.id,
          type: "worldnoteCard" as const,
          position: card.position,
          selected: true,
          data: worldCardToNodeData(card, vaultPath, {
            visibleSocketsSettings: visibleSocketsSettingsRef.current,
            cardTypeBadgeColors: cardTypeBadgeColorsRef.current,
            kinshipLabelColors: kinshipLabelColorsRef.current,
            links,
            cardsById: nextCardsById,
            ...cardNodeSaveCallbacks(card, (nextCard, options) =>
              handleSaveCardRef.current(nextCard, options),
            ),
          }),
        })),
        ...duplicatedImageNodes,
        ...duplicatedNoteNodes,
      ]);

      if (pastedCardIds.length > 0) {
        setSelectedCardIds(pastedCardIds);
        setSelectedImageIds([]);
        setSelectedLinkId(null);
        setInspectorMode("read");
      } else if (pastedImageIds.length > 0) {
        setSelectedImageIds(pastedImageIds);
        setSelectedCardIds([]);
        setSelectedLinkId(null);
        setImageContextMenu(null);
      } else if (duplicatedNoteNodes.length > 0) {
        setSelectedCardIds([]);
        setSelectedImageIds([]);
        setSelectedLinkId(null);
        setStickyNoteContextMenu(null);
      }
    } catch (error) {
      console.error("Failed to paste canvas selection:", error);
    }
  }, [
    buildStickyNoteCallbacks,
    nextPasteGeneration,
    pushCanvasHistory,
    setNodes,
    vaultPath,
  ]);

  const performDeleteSelection = useCallback(async () => {
    const linkId = selectedLinkId;
    if (linkId) {
      await handleDeleteLink(linkId);
      return;
    }

    const imageIds = [...selectedImageIds];
    if (imageIds.length > 0) {
      for (const imageId of imageIds) {
        await handleDeleteImage(imageId);
      }
      setSelectedImageIds([]);
      setImageContextMenu(null);
      return;
    }

    const noteIds = nodesRef.current
      .filter((node) => node.type === "worldnoteNote" && node.selected)
      .map((node) => node.id);
    if (noteIds.length > 0) {
      for (const noteId of noteIds) {
        await handleDeleteStickyNote(noteId);
      }
      setStickyNoteContextMenu(null);
      return;
    }

    const cardIds = [...selectedCardIds];
    if (cardIds.length > 0) {
      for (const cardId of cardIds) {
        await handleDeleteCard(cardId);
      }
      clearCardSelection();
    }
  }, [
    clearCardSelection,
    handleDeleteCard,
    handleDeleteImage,
    handleDeleteStickyNote,
    handleDeleteLink,
    selectedCardIds,
    selectedImageIds,
    selectedLinkId,
  ]);

  const handleKeyboardDelete = useCallback(async () => {
    pushCanvasHistory();
    await runWithoutHistoryPush(performDeleteSelection);
  }, [performDeleteSelection, pushCanvasHistory, runWithoutHistoryPush]);

  const handleCutSelection = useCallback(() => {
    handleCopySelection();
    pushCanvasHistory();
    void runWithoutHistoryPush(performDeleteSelection);
  }, [
    handleCopySelection,
    performDeleteSelection,
    pushCanvasHistory,
    runWithoutHistoryPush,
  ]);

  const handleSelectAll = useCallback(() => {
    const cardIds = Object.keys(cardsByIdRef.current);
    const imageIds = nodesRef.current
      .filter((node) => node.type === "worldnoteImage")
      .map((node) => node.id);
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        selected:
          (node.type === "worldnoteCard" && cardIds.includes(node.id)) ||
          (node.type === "worldnoteImage" && imageIds.includes(node.id)),
      })),
    );
    setSelectedCardIds(cardIds);
    setSelectedImageIds(imageIds);
    setSelectedLinkId(null);
  }, [setNodes]);

  const handleDeleteSelection = useCallback(async () => {
    pushCanvasHistory();
    if (selectedCardIds.length > 1) {
      await runWithoutHistoryPush(handleDeleteSelectedCards);
      return;
    }
    if (selectedImageIds.length > 1) {
      await runWithoutHistoryPush(handleDeleteSelectedImages);
    }
  }, [
    handleDeleteSelectedCards,
    handleDeleteSelectedImages,
    pushCanvasHistory,
    runWithoutHistoryPush,
    selectedCardIds.length,
    selectedImageIds.length,
  ]);

  const onDragOver = useCallback(
    (event: DragEvent) => {
      const types = Array.from(event.dataTransfer.types);
      if (
        !types.includes("application/worldnote-card-type") &&
        !types.includes("application/worldnote-card-ref") &&
        !types.includes(WIZARD_CARD_MIME) &&
        !(isWizardOpen && types.includes("text/plain"))
      ) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      if (canvasPointerApiRef.current) {
        lastCanvasPointerRef.current =
          canvasPointerApiRef.current.clientToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
      }
    },
    [isWizardOpen],
  );

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!vaultPath) {
        return;
      }

      const cardRefRaw = event.dataTransfer.getData(
        "application/worldnote-card-ref",
      );
      if (cardRefRaw) {
        const parsed = readVaultCardRefPayload(cardRefRaw);
        if (!parsed?.sourceWorldPath || !parsed.cardId) {
          return;
        }
        if (parsed.sourceWorldPath === vaultPath) {
          return;
        }

        const position =
          canvasPointerApiRef.current?.clientToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }) ?? ({ x: 0, y: 0 } satisfies CanvasFlowPointer);

          const tempId = crypto.randomUUID();
          setNodes((prev) => [
            ...prev,
            {
              id: tempId,
              type: "worldnoteCard",
              position,
              data: {
                title: "Copying…",
                subtitle: "Vault",
                cardType: "item",
                enterAnimation: true,
              },
            },
          ]);

          void copyCardToWorld({
            sourceWorldPath: parsed.sourceWorldPath,
            targetWorldPath: vaultPath,
            cardId: parsed.cardId,
            position,
          })
            .then(async (created) => {
              const cards = await listCards(vaultPath);
              const card = cards.find((entry) => entry.id === created.cardId);
              if (!card) {
                throw new Error("Copied card was not found after creation");
              }
              setCardsById((prev) => ({ ...prev, [card.id]: card }));
              const links = await listLinks(vaultPath);
              setLinksById(linksRecord(links));
              setNodes((prev) =>
                prev.map((node) =>
                  node.id === tempId
                    ? {
                        id: card.id,
                        type: "worldnoteCard",
                        position: card.position,
                        data: worldCardToNodeData(card, vaultPath, {
                          visibleSocketsSettings,
                          cardTypeBadgeColors,
                          kinshipLabelColors,
                          links,
                          cardsById: {
                            ...cardsByIdRef.current,
                            [card.id]: card,
                          },
                        }),
                      }
                    : node,
                ),
              );
              setSelectedCardIds([card.id]);
              setSelectedLinkId(null);
              setInspectorMode("edit");
            })
            .catch((error) => {
              console.error("Failed to copy card:", error);
              setNodes((prev) => prev.filter((node) => node.id !== tempId));
            });
        return;
      }

      const droppedTypeRaw = event.dataTransfer.getData(
        "application/worldnote-card-type",
      );
      if (!isNewCardType(droppedTypeRaw)) {
        return;
      }
      const droppedType = droppedTypeRaw;

      const position =
        canvasPointerApiRef.current?.clientToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }) ?? ({ x: 0, y: 0 } satisfies CanvasFlowPointer);

      void addCard(droppedType, position);
    },
    [
      addCard,
      cardTypeBadgeColors,
      kinshipLabelColors,
      listCards,
      setNodes,
      vaultPath,
      visibleSocketsSettings,
    ],
  );

  useEffect(() => {
    if (
      storedWorldName?.trim() ||
      !vaultPath?.trim() ||
      !worldnoteRoot?.trim()
    ) {
      setResolvedWorldName(null);
      return;
    }

    let cancelled = false;
    void listWorlds(worldnoteRoot).then((worlds) => {
      if (cancelled) {
        return;
      }
      const match = worlds.find((world) => world.path === vaultPath);
      setResolvedWorldName(match?.name ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [storedWorldName, vaultPath, worldnoteRoot]);

  const worldName = useMemo(() => {
    if (storedWorldName?.trim()) {
      return storedWorldName.trim();
    }
    if (resolvedWorldName?.trim()) {
      return resolvedWorldName.trim();
    }
    if (vaultPath) {
      return worldNameFromPath(vaultPath);
    }
    return "World";
  }, [resolvedWorldName, storedWorldName, vaultPath]);

  const selectedCard =
    selectedCardIds.length === 1
      ? (cardsById[selectedCardIds[0] ?? ""] ?? null)
      : null;
  const selectedStickyNote = useMemo((): NoteFlowNode | null => {
    const notes = nodes.filter(
      (node): node is NoteFlowNode =>
        node.type === "worldnoteNote" && node.selected === true,
    );
    return notes.length === 1 ? notes[0] : null;
  }, [nodes]);
  const selectedStickyNoteCallbacks = useMemo(
    () =>
      selectedStickyNote
        ? buildStickyNoteCallbacks(selectedStickyNote.id)
        : null,
    [buildStickyNoteCallbacks, selectedStickyNote],
  );
  const selectedCanvasImage = useMemo((): ImageFlowNode | null => {
    const images = nodes.filter(
      (node): node is ImageFlowNode =>
        node.type === "worldnoteImage" && node.selected === true,
    );
    return images.length === 1 ? images[0] : null;
  }, [nodes]);
  const canvasCardCount = useMemo(
    () => nodes.filter((node) => node.type === "worldnoteCard").length,
    [nodes],
  );
  const showCanvasEmptyState =
    isVaultDataLoaded &&
    Boolean(vaultPath) &&
    canvasCardCount === 0 &&
    !isWizardOpen &&
    !isGraphViewOpen &&
    !isTimelineOpen;
  const canvasCardIds = useMemo(
    () =>
      new Set(
        nodes
          .filter((node) => node.type === "worldnoteCard")
          .map((node) => node.id),
      ),
    [nodes],
  );
  const canvasAttachments = useMemo(
    () =>
      nodes
        .filter((node): node is ImageFlowNode => node.type === "worldnoteImage")
        .map((node) => ({
          id: node.id,
          label: attachmentLabelFromPath(node.data.imagePath),
        })),
    [nodes],
  );
  const selectedLink = selectedLinkId ? linksById[selectedLinkId] : null;
  const hasBulkCardSelection = selectedCardIds.length > 1;
  const inspectorPanelOpen = Boolean(
    selectedCard &&
      vaultPath &&
      !selectedLink &&
      !hasBulkCardSelection &&
      !isWizardOpen,
  );
  const linkPanelOpen = Boolean(
    selectedLink && vaultPath && selectedCardIds.length === 0,
  );

  const selectionToolbar = useMemo(() => {
    const selectedCount =
      selectedCardIds.length > 1
        ? selectedCardIds.length
        : selectedImageIds.length > 1
          ? selectedImageIds.length
          : 0;
    if (selectedCount <= 1) {
      return null;
    }
    return <BulkSelectionToolbar selectedCount={selectedCount} />;
  }, [selectedCardIds.length, selectedImageIds.length]);

  useCanvasCommandPaletteShortcut({
    isOpen: isCommandPaletteOpen,
    onOpen: () => setIsCommandPaletteOpen(true),
    onClose: () => setIsCommandPaletteOpen(false),
  });

  useCanvasEditShortcuts({
    enabled:
      !linkPanelOpen &&
      (!inspectorPanelOpen || inspectorMode === "read"),
    shortcuts: canvasShortcuts,
    onCopy: handleCopySelection,
    onCut: handleCutSelection,
    onPaste: () => {
      void handlePasteFromClipboard();
    },
    onDuplicate: () => {
      void handleDuplicateSelection();
    },
    onSelectAll: handleSelectAll,
    onDelete: () => {
      void handleKeyboardDelete();
    },
    onUndo: () => {
      void handleHistoryUndo();
    },
    onRedo: () => {
      void handleHistoryRedo();
    },
  });

  return (
    <div className="relative h-screen min-h-0 overflow-hidden bg-wn-mono-950 text-wn-mono-100">
      <CanvasHeader
        worldName={worldName}
        onBackToHome={onBack}
        onOpenVault={onOpenVault}
        onOpenSettings={onOpenSettings}
      />

      <CanvasViewToolbar
        onToggleGraphView={
          vaultPath ? () => setIsGraphViewOpen((open) => !open) : undefined
        }
        isGraphViewOpen={isGraphViewOpen}
        onToggleTimeline={
          vaultPath && timelineEnabled
            ? () => setIsTimelineOpen((open) => !open)
            : undefined
        }
        isTimelineOpen={isTimelineOpen}
      />

      <ReactFlowProvider>
        <div className="relative h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
          {showCanvasEmptyState ? (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 pb-24">
              <CanvasEmptyState
                onAddCharacter={() => {
                  void addCard("character", undefined, {
                    preferViewportCenter: true,
                  });
                }}
                onAddLocation={() => {
                  void addCard("location", undefined, {
                    preferViewportCenter: true,
                  });
                }}
                onOpenWizard={() => setIsWizardOpen(true)}
              />
            </div>
          ) : null}
          <CanvasFlow
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onSelectionChange={handleSelectionChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            nodesDraggable
            vaultPath={vaultPath}
            cardsByIdRef={cardsByIdRef}
            linksByIdRef={linksByIdRef}
            visibleSocketsSettingsRef={visibleSocketsSettingsRef}
            cardTypeBadgeColorsRef={cardTypeBadgeColorsRef}
            kinshipLabelColorsRef={kinshipLabelColorsRef}
            setNodes={setNodes}
            setEdges={setEdges}
            setCardsById={setCardsById}
            setLinksById={setLinksById}
            setSelectedCardIds={setSelectedCardIds}
            setSelectedLinkId={setSelectedLinkId}
            setInspectorMode={setInspectorMode}
            onNodeDragStart={() => {
              if (!dragHistoryPushedRef.current) {
                pushCanvasHistory();
                dragHistoryPushedRef.current = true;
              }
            }}
            onNodeDragStop={(_, node) => {
              dragHistoryPushedRef.current = false;
              if (isNoteFlowNode(node)) {
                if (!updateStickyNotePosition) {
                  return;
                }
                const snapped = snapFlowPosition(node.position);
                if (
                  snapped.x !== node.position.x ||
                  snapped.y !== node.position.y
                ) {
                  setNodes((prev) =>
                    prev.map((entry) =>
                      entry.id === node.id
                        ? { ...entry, position: snapped }
                        : entry,
                    ),
                  );
                }
                void updateStickyNotePosition(
                  StickyNotePlacementSchema.parse({
                    ...stickyNotePlacementFromFlowNode(node),
                    x: snapped.x,
                    y: snapped.y,
                  }),
                );
                return;
              }
              if (isImageFlowNode(node)) {
                if (!updateImagePosition) {
                  return;
                }
                const snapped = snapFlowPosition(node.position);
                if (
                  snapped.x !== node.position.x ||
                  snapped.y !== node.position.y
                ) {
                  setNodes((prev) =>
                    prev.map((entry) =>
                      entry.id === node.id
                        ? { ...entry, position: snapped }
                        : entry,
                    ),
                  );
                }
                void updateImagePosition({
                  ...canvasImagePlacementFromFlowNode(node),
                  x: snapped.x,
                  y: snapped.y,
                });
                return;
              }
              if (!updateCardPosition) {
                return;
              }
              setNodes((prev) => {
                const cardChanges: NodeChange<CanvasFlowNode>[] = [];
                for (const entry of prev) {
                  if (entry.type !== "worldnoteCard" || !entry.selected) {
                    continue;
                  }
                  const snapped = snapFlowPosition(entry.position);
                  if (
                    snapped.x === entry.position.x &&
                    snapped.y === entry.position.y
                  ) {
                    continue;
                  }
                  cardChanges.push({
                    id: entry.id,
                    type: "position",
                    position: snapped,
                    dragging: false,
                  });
                }

                const nextNodes =
                  cardChanges.length > 0
                    ? applyNodeChanges(cardChanges, prev)
                    : prev;

                for (const entry of nextNodes) {
                  if (entry.type !== "worldnoteCard" || !entry.selected) {
                    continue;
                  }
                  void updateCardPosition({
                    cardId: entry.id,
                    x: entry.position.x,
                    y: entry.position.y,
                  });
                }

                return nextNodes;
              });
            }}
            onNodeDoubleClick={(_, node) => {
              if (node.type === "worldnoteImage") {
                return;
              }
              if (node.type === "worldnoteNote") {
                buildStickyNoteCallbacks(node.id).onRequestEdit?.();
                return;
              }
              setNodes((nds) =>
                nds.map((n) => ({
                  ...n,
                  selected: n.id === node.id,
                })),
              );
              setSelectedCardIds([node.id]);
              setSelectedImageIds([]);
              setSelectedLinkId(null);
              setInspectorMode("edit");
            }}
            onEdgeDoubleClick={(_, edge) => {
              setSelectedLinkId(edge.id);
              setSelectedCardIds([]);
            }}
            selectedCardIds={selectedCardIds}
            selectedImageIds={selectedImageIds}
            onNodeContextMenu={handleNodeContextMenu}
            onSelectionContextMenu={handleSelectionContextMenu}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            imageContextMenu={imageContextMenu}
            onCloseImageContextMenu={handlePaneClick}
            cardContextMenu={cardContextMenu}
            onCloseCardContextMenu={handlePaneClick}
            onCardContextDuplicate={(cardId) => {
              void handleCardContextDuplicate(cardId);
            }}
            onCardContextCopy={handleCardContextCopy}
            onCardContextShowChangeType={() => {
              setCardContextMenu((current) =>
                current ? { ...current, view: "change-type" as const } : null,
              );
            }}
            onCardContextBackToActions={() => {
              setCardContextMenu((current) =>
                current ? { ...current, view: "actions" } : null,
              );
            }}
            onCardChangeType={(cardId, newType) => {
              void handleCardChangeType(cardId, newType);
            }}
            onCardContextDelete={(cardId) => {
              void handleCardContextDelete(cardId);
            }}
            onOpenWizardWithCards={handleOpenWizardWithCards}
            selectedCardIdsForWizard={selectedCardIds}
            onCreateFamilyCard={
              canCreateFamilyFromSelection
                ? () => {
                    void handleCreateFamilyFromSelection();
                  }
                : undefined
            }
            createFamilyCardLabel={createFamilyCardLabel}
            onDuplicateCanvasImage={(imageId) => {
              void handleDuplicateCanvasImage(imageId);
            }}
            onDeleteCanvasImage={(imageId) => {
              void handleDeleteImage(imageId);
            }}
            onFlipCanvasImageHorizontal={handleFlipCanvasImageHorizontal}
            onFlipCanvasImageVertical={handleFlipCanvasImageVertical}
            onRotateCanvasImageClockwise={handleRotateCanvasImageClockwise}
            onImageResizeEnd={handleImageResizeEnd}
            stickyNoteContextMenu={stickyNoteContextMenu}
            onCloseStickyNoteContextMenu={handlePaneClick}
            onDuplicateStickyNote={(noteId) => {
              void handleDuplicateStickyNote(noteId);
            }}
            onCopyStickyNote={handleStickyNoteContextCopy}
            onDeleteStickyNote={(noteId) => {
              void handleDeleteStickyNote(noteId);
            }}
            onStickyNoteResizeEnd={handleStickyNoteResizeEnd}
            focusCardRef={focusCardRef}
            lastCanvasPointerRef={lastCanvasPointerRef}
            canvasPointerApiRef={canvasPointerApiRef}
            onImportCanvasImage={handleImportCanvasImage}
          />
        </div>

      <CanvasToolbar
        activeTool={activeTool}
        noteToolbar={
          selectedStickyNote && selectedStickyNoteCallbacks ? (
            <StickyNoteToolbar
              heading={selectedStickyNote.data.heading}
              color={selectedStickyNote.data.color}
              onChangeHeading={selectedStickyNoteCallbacks.onChangeHeading}
              onChangeColor={selectedStickyNoteCallbacks.onChangeColor}
              onDelete={selectedStickyNoteCallbacks.onDelete}
            />
          ) : null
        }
        imageToolbar={
          selectedCanvasImage ? (
            <CanvasImageToolbar
              position={
                selectedCanvasImage.data.imagePosition ??
                defaultCanvasImageNodePosition()
              }
              onPositionChange={(imagePosition) => {
                handleCanvasImagePositionChange(
                  selectedCanvasImage.id,
                  imagePosition,
                );
              }}
            />
          ) : null
        }
        selectionToolbar={selectionToolbar}
        onCreate={(type) => {
          void addCard(type, undefined, { preferViewportCenter: true });
        }}
        onImageTool={() => {
          void handleImageTool();
        }}
        onTextTool={() => {
          void handleTextTool();
        }}
        textToolDisabled={!vaultPath}
        imageToolDisabled={!vaultPath || !isTauriRuntime()}
        onOpenVault={onOpenVault}
        onToggleAllCardViews={() => {
          void toggleAllCardViews();
        }}
        onToggleWizard={() => {
          setIsWizardOpen((open) => {
            if (open) {
              setWizardSeedCardIds(null);
              return false;
            }
            setWizardSeedCardIds(null);
            return true;
          });
        }}
        isWizardOpen={isWizardOpen}
        familyTreeBanner={
          familyTreeAnchorId ? (
            <div className="flex items-center gap-2 rounded-full border border-wn-border bg-wn-surface/90 px-3 py-1.5 text-xs text-wn-text-muted shadow-sm">
              <span>
                Family Tree · relations to{" "}
                {cardsById[familyTreeAnchorId]?.name ?? "character"}
              </span>
              <button
                type="button"
                className="rounded-full border border-wn-border bg-wn-surface px-2.5 py-1 font-semibold text-wn-text transition-colors hover:border-wn-mono-50 hover:text-wn-text"
                onClick={() => {
                  void handleCreateFamilyFromSelection();
                }}
              >
                {createFamilyCardLabel}
              </button>
            </div>
          ) : null
        }
      />
      </ReactFlowProvider>

      <Inspector
        isOpen={Boolean(
          selectedCard &&
            vaultPath &&
            !selectedLink &&
            !hasBulkCardSelection &&
            !isWizardOpen,
        )}
        mode={inspectorMode}
        onModeChange={setInspectorMode}
        card={selectedCard ?? undefined}
        vaultPath={vaultPath ?? ""}
        links={Object.values(linksById)}
        cardsById={cardsById}
        onClose={clearCardSelection}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        onNavigateToCard={handleNavigateToCard}
        onCreateSocketLink={(socketId, targetCardId) => {
          void handleInspectorCreateSocketLink(socketId, targetCardId);
        }}
        onRemoveSocketLink={(linkId) => {
          void handleInspectorRemoveSocketLink(linkId);
        }}
        onCreateAndLinkCard={(socketId, cardType, name) => {
          void handleInspectorCreateAndLinkCard(socketId, cardType, name);
        }}
        worldName={worldName}
        onOpenWizard={(cardId) => {
          handleOpenWizardWithCards([cardId]);
        }}
      />

      <LinkEditorPanel
        isOpen={Boolean(
          selectedLink && vaultPath && selectedCardIds.length === 0,
        )}
        link={selectedLink ?? undefined}
        sourceCardName={
          selectedLink
            ? (cardsById[selectedLink.source_card]?.name ?? "Unknown card")
            : ""
        }
        targetCardName={
          selectedLink
            ? (cardsById[selectedLink.target_card]?.name ?? "Unknown card")
            : ""
        }
        onClose={() => setSelectedLinkId(null)}
        onDelete={handleDeleteLink}
      />

      <WorldWizardPanel
        isOpen={isWizardOpen && Boolean(vaultPath)}
        onClose={handleCloseWizard}
        worldName={worldName}
        cardsById={cardsById}
        links={Object.values(linksById)}
        vaultPath={vaultPath ?? ""}
        seedCardIds={wizardSeedCardIds}
        onSpawnCard={(card) => {
          void handleSpawnCard(card);
        }}
        onApplyCard={(card) => {
          void handleSaveCard(card);
        }}
      />

      <GlobalGraphView
        isOpen={isGraphViewOpen && Boolean(vaultPath)}
        onClose={() => setIsGraphViewOpen(false)}
        cardsById={cardsById}
        links={Object.values(linksById)}
        canvasCardIds={canvasCardIds}
        canvasAttachments={canvasAttachments}
        onNavigateToCard={handleNavigateToCard}
        onAddCharacter={() => {
          void addCard("character", undefined, { preferViewportCenter: true });
        }}
      />

      {vaultPath && timelineEnabled ? (
        <TimelineWorkspace
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          vaultPath={vaultPath}
          cardsById={cardsById}
          eras={eras}
          periods={periods}
          calendarConfig={calendarConfig}
          onSaveCard={handleSaveCard}
          onSaveEra={handleSaveEra}
          onSavePeriod={handleSavePeriod}
        />
      ) : null}

      <CanvasCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        vaultPath={vaultPath}
        cardsById={cardsById}
        onJumpToCard={handleNavigateToCard}
      />
    </div>
  );
}
