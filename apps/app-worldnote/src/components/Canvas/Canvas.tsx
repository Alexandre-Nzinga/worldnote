import {
  canonicalSocketId,
  CardNode,
  canvasImageNodeStyle,
  canvasImageNodeStyleForNaturalSize,
  ImageNode,
  LinkEdge,
  type CanvasFlowNode,
  type CardFlowNode,
  type ImageFlowNode,
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
  type OnNodesChange,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import {
  CARD_TYPE_LABELS,
  NEW_CARD_DEFAULT_NAMES,
  type Link,
  type WorldCard,
} from "@worldnote/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, MouseEvent } from "react";
import { useCardCommands } from "../../hooks/useCardCommands.js";
import { useSettings } from "../../hooks/useSettings.js";
import { useVault } from "../../hooks/useVault.js";
import { WIZARD_CARD_MIME } from "../../services/canvas/cardDragOut.js";
import { canvasNodePosition } from "./canvasNodePosition.js";
import { cardImageSrc, worldCardToNodeData } from "../../services/canvas/cardNodeData.js";
import {
  updateCanvasManifestImage,
  updateCanvasManifestNode,
} from "../../services/canvas/canvasManifest.js";
import {
  imagePlacementToFlowNode,
  vaultAbsoluteImagePath,
} from "../../services/canvas/canvasImageNode.js";
import { loadImageNaturalSize } from "../../services/canvas/loadImageNaturalSize.js";
import { createCanvasImagePositionUpdater } from "../../services/canvas/updateCanvasImagePosition.js";
import { createCardPositionUpdater } from "../../services/canvas/updateCardPosition.js";
import {
  deleteCanvasImage,
  pickCardImageFile,
  saveCanvasImage,
} from "../../services/desktop/saveCanvasImage.js";
import { isTauriRuntime } from "../../services/desktop/tauriRuntime.js";
import { createWorldCard } from "../../services/crudWorldCard/createWorldCard.js";
import { groupSelectedWorldCards } from "../../services/crudWorldCard/groupSelectedWorldCards.js";
import type { NewCardType } from "../../services/crudWorldCard/cardTemplates.js";
import { deleteWorldCard } from "../../services/crudWorldCard/deleteWorldCard.js";
import { duplicateWorldCard } from "../../services/crudWorldCard/duplicateWorldCard.js";
import { updateWorldCard } from "../../services/crudWorldCard/updateWorldCard.js";
import { createLink } from "../../services/links/createLink.js";
import { deleteLink } from "../../services/links/deleteLink.js";
import { linkToEdge } from "../../services/links/linkToEdge.js";
import { listLinks } from "../../services/links/listLinks.js";
import { LinkEditorPanel } from "./LinkEditorPanel.js";
import { Inspector, type InspectorMode } from "./Inspector.js";
import { CanvasFlow } from "./CanvasFlow.js";
import type {
  CanvasImageDropPosition,
  CanvasImageImportOptions,
} from "./useCanvasExternalImageDrop.js";
import type { CanvasImageContextMenuState } from "./CanvasImageContextMenu.js";
import { CanvasHeader } from "./CanvasHeader.js";
import { CanvasCommandPalette } from "./CanvasCommandPalette.js";
import { CanvasToolbar, type CanvasTool } from "./CanvasToolbar.js";
import { WorldWizardPanel } from "./wizard/WorldWizardPanel.js";
import { useCanvasCommandPaletteShortcut } from "./useCanvasCommandPaletteShortcut.js";
import { useCanvasEditShortcuts } from "./useCanvasEditShortcuts.js";
import {
  useCanvasClipboard,
  type CanvasClipboardItem,
} from "../../services/canvas/canvasClipboard.js";
import {
  captureCanvasHistorySnapshot,
  restoreCanvasHistorySnapshot,
  useCanvasHistoryStore,
  type CanvasHistorySnapshot,
} from "../../services/canvas/canvasHistory.js";
import {
  isValidEasyConnection,
  normalizeConnection,
} from "../../services/links/resolveEasyConnect.js";
import { copyCardToWorld } from "../../services/library/copyCardToWorld.js";
import { listWorlds } from "../../services/worlds/listWorlds.js";

const nodeTypes = {
  worldnoteCard: CardNode,
  worldnoteImage: ImageNode,
};

function selectedCardIdsFromNodes(
  nodeList: CanvasFlowNode[],
  cards: Record<string, WorldCard>,
): string[] {
  return nodeList
    .filter(
      (node) =>
        node.type === "worldnoteCard" && node.selected && cards[node.id] != null,
    )
    .map((node) => node.id);
}

function selectedImageIdsFromNodes(nodeList: CanvasFlowNode[]): string[] {
  return nodeList
    .filter((node) => node.type === "worldnoteImage" && node.selected)
    .map((node) => node.id);
}

const edgeTypes: EdgeTypes = {
  link: LinkEdge,
};

const CANVAS_PASTE_OFFSET_PX = 48;

type CanvasProps = {
  onBack: () => void;
  onOpenVault?: () => void;
};

function cardsRecord(cards: WorldCard[]): Record<string, WorldCard> {
  return Object.fromEntries(cards.map((card) => [card.id, card]));
}

function linksRecord(links: Link[]): Record<string, Link> {
  return Object.fromEntries(links.map((link) => [link.id, link]));
}

function worldNameFromPath(vaultPath: string): string {
  const folder = vaultPath.split(/[/\\]/).pop();
  return folder ?? "World";
}

export function Canvas({ onBack, onOpenVault }: CanvasProps) {
  const vaultPath = useVault((state) => state.currentVaultPath);
  const storedWorldName = useVault((state) => state.currentWorldName);
  const worldnoteRoot = useSettings((state) => state.settings?.worldnoteRoot);
  const visibleSocketsSettings = useSettings(
    (state) => state.settings?.visibleSockets,
  );
  const canvasShortcuts = useSettings(
    (state) => state.settings?.canvasShortcuts,
  );
  const setCanvasClipboard = useCanvasClipboard((state) => state.setClipboard);
  const nextPasteGeneration = useCanvasClipboard(
    (state) => state.nextPasteGeneration,
  );
  const [resolvedWorldName, setResolvedWorldName] = useState<string | null>(
    null,
  );
  const { listCards, loadCanvasManifest } = useCardCommands();
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
  const [imageContextMenu, setImageContextMenu] =
    useState<CanvasImageContextMenuState | null>(null);

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const cardsByIdRef = useRef(cardsById);
  cardsByIdRef.current = cardsById;

  const linksByIdRef = useRef(linksById);
  linksByIdRef.current = linksById;

  const visibleSocketsSettingsRef = useRef(visibleSocketsSettings);
  visibleSocketsSettingsRef.current = visibleSocketsSettings;

  const isApplyingHistoryRef = useRef(false);
  const skipHistoryPushRef = useRef(false);
  const dragHistoryPushedRef = useRef(false);
  const handleSaveCardRef = useRef<(card: WorldCard) => Promise<void>>(
    async () => {},
  );

  const focusCardRef = useRef<((cardId: string) => void) | undefined>(
    undefined,
  );

  const captureHistorySnapshot = useCallback((): CanvasHistorySnapshot | null => {
    if (!vaultPath) {
      return null;
    }
    return captureCanvasHistorySnapshot(
      vaultPath,
      nodesRef.current,
      cardsByIdRef.current,
      linksByIdRef.current,
    );
  }, [vaultPath]);

  const pushCanvasHistory = useCallback(() => {
    if (
      !vaultPath ||
      isApplyingHistoryRef.current ||
      skipHistoryPushRef.current
    ) {
      return;
    }
    const snapshot = captureHistorySnapshot();
    if (snapshot) {
      useCanvasHistoryStore.getState().push(snapshot);
    }
  }, [captureHistorySnapshot, vaultPath]);

  const applyHistorySnapshot = useCallback(
    async (snapshot: CanvasHistorySnapshot) => {
      if (!vaultPath || snapshot.vaultPath !== vaultPath) {
        return;
      }

      const currentImageIds = nodesRef.current
        .filter((node) => node.type === "worldnoteImage")
        .map((node) => node.id);

      isApplyingHistoryRef.current = true;
      try {
        await restoreCanvasHistorySnapshot(
          snapshot,
          cardsByIdRef.current,
          linksByIdRef.current,
          currentImageIds,
        );

        const record = cardsRecord(snapshot.cards);
        const linksRecordMap = linksRecord(snapshot.links);
        const links = snapshot.links;
        setCardsById(record);
        setLinksById(linksRecordMap);
        setEdges(links.map((link) => linkToEdge(link)));

        const cardNodes: CanvasFlowNode[] = snapshot.cards.map((card) => ({
          id: card.id,
          type: "worldnoteCard",
          position: card.position,
          data: worldCardToNodeData(card, vaultPath, {
            visibleSocketsSettings: visibleSocketsSettingsRef.current,
            links,
            cardsById: record,
            onUpdate: (partial) => {
              const existing = record[card.id];
              if (!existing) {
                return;
              }
              void handleSaveCardRef.current({
                ...existing,
                ...partial,
              } as WorldCard);
            },
          }),
        }));
        const imageNodes: CanvasFlowNode[] = snapshot.images.flatMap((image) => {
          const node = imagePlacementToFlowNode(image, vaultPath);
          return node ? [node] : [];
        });
        setNodes([...cardNodes, ...imageNodes]);
        setSelectedCardIds([]);
        setSelectedImageIds([]);
        setSelectedLinkId(null);
        setImageContextMenu(null);
      } catch (error) {
        console.error("Failed to apply canvas history:", error);
      } finally {
        isApplyingHistoryRef.current = false;
      }
    },
    [setEdges, setNodes, vaultPath],
  );

  const handleHistoryUndo = useCallback(async () => {
    const current = captureHistorySnapshot();
    if (!current) {
      return;
    }
    const previous = useCanvasHistoryStore.getState().undo(current);
    if (previous) {
      await applyHistorySnapshot(previous);
    }
  }, [applyHistorySnapshot, captureHistorySnapshot]);

  const handleHistoryRedo = useCallback(async () => {
    const current = captureHistorySnapshot();
    if (!current) {
      return;
    }
    const next = useCanvasHistoryStore.getState().redo(current);
    if (next) {
      await applyHistorySnapshot(next);
    }
  }, [applyHistorySnapshot, captureHistorySnapshot]);

  useEffect(() => {
    void vaultPath;
    useCanvasHistoryStore.getState().reset();
  }, [vaultPath]);

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

  const handleSelectionChange = useCallback(
    ({
      nodes: selectedNodes,
      edges: selectedEdges,
    }: OnSelectionChangeParams) => {
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
        return;
      }

      if (imageIds.length > 0) {
        setSelectedImageIds(imageIds);
        setSelectedCardIds([]);
        setSelectedLinkId(null);
        return;
      }

      const selectedEdge = selectedEdges[0];
      if (selectedEdge) {
        setSelectedLinkId(selectedEdge.id);
        setSelectedCardIds([]);
        setSelectedImageIds([]);
        return;
      }

      setSelectedCardIds([]);
      setSelectedImageIds([]);
      setSelectedLinkId(null);
    },
    [],
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

  const handleSaveCard = useCallback(
    async (card: WorldCard) => {
      if (!vaultPath) {
        return;
      }
      const node = nodesRef.current.find((entry) => entry.id === card.id);
      const cardWithPosition = node
        ? { ...card, position: node.position }
        : card;
      const saved = await updateWorldCard(vaultPath, cardWithPosition);
      setCardsById((prev) => ({ ...prev, [saved.id]: saved }));
    },
    [vaultPath],
  );
  const toggleAllCardViews = useCallback(async () => {
    if (!vaultPath || isBulkTogglingView) {
      return;
    }

    const cards = Object.values(cardsByIdRef.current);
    if (cards.length === 0) {
      return;
    }

    const currentModes = cards.map(
      (card) => card.custom_properties?.view_mode as unknown,
    );
    const allNode = currentModes.every((mode) => mode === "node");
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
        updated.map((card) => updateWorldCard(vaultPath, card)),
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
            links,
            cardsById: cards,
            onUpdate: (partial) => {
              void handleSaveCardRef.current({
                ...card,
                ...partial,
              } as WorldCard);
            },
          }),
        };
      }),
    );
  }, [linksById, setNodes, vaultPath, visibleSocketsSettings]);

  useEffect(() => {
    if (!vaultPath || Object.keys(cardsById).length === 0) {
      return;
    }
    applyNodeDataFromCards();
  }, [applyNodeDataFromCards, cardsById, vaultPath]);

  useEffect(() => {
    if (!vaultPath) {
      setNodes([]);
      setEdges([]);
      setCardsById({});
      setLinksById({});
      setSelectedCardIds([]);
      setSelectedImageIds([]);
      setSelectedLinkId(null);
      return;
    }

    let isDisposed = false;
    void Promise.all([
      listCards(vaultPath),
      loadCanvasManifest(vaultPath),
      listLinks(vaultPath),
    ])
      .then(([cards, manifest, links]) => {
        if (isDisposed) {
          return;
        }

        const placementById = new Map(
          manifest.nodes.map((node) => [node.cardId, { x: node.x, y: node.y }]),
        );

        const record = cardsRecord(cards);
        setCardsById(record);
        setLinksById(linksRecord(links));
        const cardNodes: CanvasFlowNode[] = cards.flatMap((card) => {
          try {
            return [
              {
                id: card.id,
                type: "worldnoteCard" as const,
                position: canvasNodePosition(
                  placementById.get(card.id),
                  card.position,
                ),
                data: worldCardToNodeData(card, vaultPath, {
                  visibleSocketsSettings,
                  links,
                  cardsById: record,
                }),
              },
            ];
          } catch (error) {
            console.error(`Skipping card ${card.id} on canvas load:`, error);
            return [];
          }
        });
        const imageNodes: CanvasFlowNode[] = (manifest.images ?? []).flatMap(
          (image) => {
            const node = imagePlacementToFlowNode(image, vaultPath);
            return node ? [node] : [];
          },
        );
        setNodes([...cardNodes, ...imageNodes]);
        setEdges(links.map(linkToEdge));
      })
      .catch((error) => {
        console.error("Failed to load canvas:", error);
      });

    return () => {
      isDisposed = true;
    };
  }, [
    listCards,
    loadCanvasManifest,
    setEdges,
    setNodes,
    vaultPath,
    visibleSocketsSettings,
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
    (cardType: NewCardType, position?: { x: number; y: number }) => {
      if (!vaultPath) {
        console.warn("Cannot create card: no vault selected");
        return Promise.resolve();
      }

      const nextPosition = position ?? {
        x: 120 + nodes.length * 24,
        y: 90 + nodes.length * 20,
      };
      const tempId = crypto.randomUUID();
      const fallbackTitle = NEW_CARD_DEFAULT_NAMES[cardType];
      const typeLabel = CARD_TYPE_LABELS[cardType];

      setNodes((prev) => [
        ...prev,
        {
          id: tempId,
          type: "worldnoteCard",
          position: nextPosition,
          data: {
            title: fallbackTitle,
            subtitle: typeLabel,
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
        })
        .catch((error) => {
          console.error("Failed to persist card:", error);
          setNodes((prev) => prev.filter((node) => node.id !== tempId));
        });
    },
    [
      cardsById,
      linksById,
      nodes.length,
      setNodes,
      vaultPath,
      visibleSocketsSettings,
    ],
  );

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
      const nextPosition = position ?? {
        x: 160 + nodesRef.current.length * 24,
        y: 120 + nodesRef.current.length * 20,
      };

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
      await addCanvasImage(sourcePath);
    } catch (error) {
      console.error("Image tool failed:", error);
    } finally {
      setActiveTool("select");
    }
  }, [addCanvasImage, vaultPath]);

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
      const imagePath = node.data.imagePath;
      if (!imagePath) {
        return;
      }
      void updateImagePosition({
        id: nodeId,
        x: node.position.x,
        y: node.position.y,
        imagePath,
        width: size.width,
        height: size.height,
      });
    },
    [setNodes, updateImagePosition],
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
        const { width, height } = imageDimensionsFromNode(node);
        const placement = {
          id: newId,
          x: node.position.x + offset,
          y: node.position.y + offset,
          imagePath: newImagePath,
          width,
          height,
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
    [imageDimensionsFromNode, pushCanvasHistory, setNodes, vaultPath],
  );

  const handleNodeContextMenu = useCallback(
    (event: MouseEvent, node: Node) => {
      if (node.type !== "worldnoteImage") {
        return;
      }
      event.preventDefault();

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
    [setNodes],
  );

  const handlePaneClick = useCallback(() => {
    setImageContextMenu(null);
  }, []);

  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      if (!vaultPath) {
        return;
      }
      pushCanvasHistory();
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
    [linksById, pushCanvasHistory, setEdges, setNodes, vaultPath],
  );

  const handleSpawnCard = useCallback(
    async (card: WorldCard) => {
      if (!vaultPath) {
        return;
      }
      const position = {
        x: 160 + nodesRef.current.length * 24,
        y: 120 + nodesRef.current.length * 20,
      };
      const placed = { ...card, position } as WorldCard;
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
                links: Object.values(linksByIdRef.current),
                cardsById: { ...cardsByIdRef.current, [saved.id]: saved },
              }),
              enterAnimation: true,
            },
          },
        ]);
        setSelectedCardIds([saved.id]);
        setSelectedLinkId(null);
      } catch (error) {
        console.error("Failed to spawn generated card:", error);
      }
    },
    [setNodes, vaultPath, visibleSocketsSettings],
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

  const clearCardSelection = useCallback(() => {
    setSelectedCardIds([]);
    setSelectedImageIds([]);
    setNodes((nds) => nds.map((node) => ({ ...node, selected: false })));
  }, [setNodes]);

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
        const { width, height } = imageDimensionsFromNode(node);
        const placement = {
          id: newId,
          x: node.position.x + offset,
          y: node.position.y + offset,
          imagePath: newImagePath,
          width,
          height,
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
  }, [imageDimensionsFromNode, selectedImageIds, setNodes, vaultPath]);

  const handleDuplicateSelectedCards = useCallback(async () => {
    if (!vaultPath || selectedCardIds.length === 0) {
      return;
    }

    const offset = { x: 48, y: 48 };
    const duplicatedCards: WorldCard[] = [];
    for (const cardId of selectedCardIds) {
      duplicatedCards.push(
        await duplicateWorldCard(vaultPath, cardId, offset),
      );
    }

    const links = Object.values(linksById);
    const nextCardsById = { ...cardsByIdRef.current };
    for (const card of duplicatedCards) {
      nextCardsById[card.id] = card;
    }
    setCardsById(nextCardsById);

    const newIds = duplicatedCards.map((card) => card.id);
    setNodes((prev) => [
      ...prev.map((node) => ({ ...node, selected: false })),
      ...duplicatedCards.map((card) => ({
        id: card.id,
        type: "worldnoteCard" as const,
        position: card.position,
        selected: true,
        data: worldCardToNodeData(card, vaultPath, {
          visibleSocketsSettings,
          links,
          cardsById: nextCardsById,
          onUpdate: (partial) => {
            const existing = nextCardsById[card.id];
            if (!existing) {
              return;
            }
            void handleSaveCardRef.current({
              ...existing,
              ...partial,
            } as WorldCard);
          },
        }),
      })),
    ]);
    setSelectedCardIds(newIds);
    setSelectedLinkId(null);
    setInspectorMode("read");
  }, [linksById, selectedCardIds, setNodes, vaultPath, visibleSocketsSettings]);

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
            links,
            cardsById: nextCardsById,
            onUpdate: (partial) => {
              const existing = nextCardsById[group.id];
              if (!existing) {
                return;
              }
              void handleSaveCardRef.current({
                ...existing,
                ...partial,
              } as WorldCard);
            },
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
    linksById,
    pushCanvasHistory,
    selectedCardIds,
    setNodes,
    vaultPath,
    visibleSocketsSettings,
  ]);

  const handleCopySelection = useCallback(() => {
    if (!vaultPath) {
      return;
    }

    const items: CanvasClipboardItem[] = [];

    for (const cardId of selectedCardIds) {
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
      const { width, height } = imageDimensionsFromNode(node);
      items.push({
        kind: "image",
        imageId,
        x: node.position.x,
        y: node.position.y,
        imagePath: node.data.imagePath,
        width,
        height,
      });
    }

    if (items.length === 0) {
      return;
    }

    setCanvasClipboard({ vaultPath, items });
  }, [
    imageDimensionsFromNode,
    selectedCardIds,
    selectedImageIds,
    setCanvasClipboard,
    vaultPath,
  ]);

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

    const offsetPx =
      nextPasteGeneration() * CANVAS_PASTE_OFFSET_PX;
    const offset = { x: offsetPx, y: offsetPx };

    const pastedCardIds: string[] = [];
    const pastedImageIds: string[] = [];
    const duplicatedCards: WorldCard[] = [];
    const duplicatedImageNodes: ImageFlowNode[] = [];

    try {
      for (const item of clipboard.items) {
        if (item.kind === "card") {
          if (!cardsByIdRef.current[item.cardId]) {
            continue;
          }
          const card = await duplicateWorldCard(
            vaultPath,
            item.cardId,
            offset,
          );
          duplicatedCards.push(card);
          pastedCardIds.push(card.id);
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
          x: item.x + offsetPx,
          y: item.y + offsetPx,
          imagePath: newImagePath,
          width: item.width,
          height: item.height,
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

      if (duplicatedCards.length === 0 && duplicatedImageNodes.length === 0) {
        return;
      }

      const links = Object.values(linksByIdRef.current);
      const nextCardsById = { ...cardsByIdRef.current };
      for (const card of duplicatedCards) {
        nextCardsById[card.id] = card;
      }
      setCardsById(nextCardsById);

      setNodes((prev) => [
        ...prev.map((node) => ({ ...node, selected: false })),
        ...duplicatedCards.map((card) => ({
          id: card.id,
          type: "worldnoteCard" as const,
          position: card.position,
          selected: true,
          data: worldCardToNodeData(card, vaultPath, {
            visibleSocketsSettings: visibleSocketsSettingsRef.current,
            links,
            cardsById: nextCardsById,
            onUpdate: (partial) => {
              const existing = nextCardsById[card.id];
              if (!existing) {
                return;
              }
              void handleSaveCardRef.current({
                ...existing,
                ...partial,
              } as WorldCard);
            },
          }),
        })),
        ...duplicatedImageNodes,
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
      }
    } catch (error) {
      console.error("Failed to paste canvas selection:", error);
    }
  }, [nextPasteGeneration, pushCanvasHistory, setNodes, vaultPath]);

  const runDeleteWithoutHistoryPush = useCallback(
    async (action: () => Promise<void>) => {
      skipHistoryPushRef.current = true;
      try {
        await action();
      } finally {
        skipHistoryPushRef.current = false;
      }
    },
    [],
  );

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
    handleDeleteLink,
    selectedCardIds,
    selectedImageIds,
    selectedLinkId,
  ]);

  const handleKeyboardDelete = useCallback(async () => {
    pushCanvasHistory();
    await runDeleteWithoutHistoryPush(performDeleteSelection);
  }, [performDeleteSelection, pushCanvasHistory, runDeleteWithoutHistoryPush]);

  const handleCutSelection = useCallback(() => {
    handleCopySelection();
    pushCanvasHistory();
    void runDeleteWithoutHistoryPush(performDeleteSelection);
  }, [
    handleCopySelection,
    performDeleteSelection,
    pushCanvasHistory,
    runDeleteWithoutHistoryPush,
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
      await runDeleteWithoutHistoryPush(handleDeleteSelectedCards);
      return;
    }
    if (selectedImageIds.length > 1) {
      await runDeleteWithoutHistoryPush(handleDeleteSelectedImages);
    }
  }, [
    handleDeleteSelectedCards,
    handleDeleteSelectedImages,
    pushCanvasHistory,
    runDeleteWithoutHistoryPush,
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
        try {
          const parsed = JSON.parse(cardRefRaw) as {
            sourceWorldPath: string;
            cardId: string;
          };
          if (!parsed?.sourceWorldPath || !parsed?.cardId) {
            return;
          }
          if (parsed.sourceWorldPath === vaultPath) {
            return;
          }

          const bounds = event.currentTarget.getBoundingClientRect();
          const position = {
            x: event.clientX - bounds.left - 120,
            y: event.clientY - bounds.top - 60,
          };

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
        } catch (error) {
          console.error("Failed to parse dropped card ref:", error);
        }
        return;
      }

      const droppedType = event.dataTransfer.getData(
        "application/worldnote-card-type",
      ) as NewCardType;
      const validTypes: NewCardType[] = [
        "character",
        "location",
        "item",
        "vehicle",
        "flora",
        "fauna",
        "building",
        "structure",
        "species",
        "planet",
        "organization",
        "polity",
        "event",
        "family",
        "group",
        "star",
        "moon",
        "asteroid",
        "satellite",
        "law",
        "religion",
        "language",
        "culture",
        "spell",
        "disease",
        "disaster",
        "combat_style",
      ];
      if (!validTypes.includes(droppedType)) {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 120,
        y: event.clientY - bounds.top - 60,
      };

      void addCard(droppedType, position);
    },
    [addCard, listCards, setNodes, vaultPath, visibleSocketsSettings],
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

  useCanvasCommandPaletteShortcut({
    isOpen: isCommandPaletteOpen,
    onOpen: () => setIsCommandPaletteOpen(true),
    onClose: () => setIsCommandPaletteOpen(false),
  });

  useCanvasEditShortcuts({
    enabled: !inspectorPanelOpen && !linkPanelOpen,
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
      />

      <ReactFlowProvider>
        <div className="h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
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
              if (node.type === "worldnoteImage") {
                if (!updateImagePosition) {
                  return;
                }
                const imageNode = node as ImageFlowNode;
                const imagePath = imageNode.data.imagePath;
                if (!imagePath) {
                  return;
                }
                const { width, height } = imageDimensionsFromNode(imageNode);
                void updateImagePosition({
                  id: node.id,
                  x: node.position.x,
                  y: node.position.y,
                  imagePath,
                  width,
                  height,
                });
                return;
              }
              if (!updateCardPosition) {
                return;
              }
              void updateCardPosition({
                cardId: node.id,
                x: node.position.x,
                y: node.position.y,
              });
            }}
            onNodeDoubleClick={(_, node) => {
              if (node.type === "worldnoteImage") {
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
            onDuplicateSelection={handleDuplicateSelection}
            onDeleteSelection={handleDeleteSelection}
            onCreateGroupFromSelection={handleGroupSelectedCards}
            onNodeContextMenu={handleNodeContextMenu}
            onPaneClick={handlePaneClick}
            imageContextMenu={imageContextMenu}
            onCloseImageContextMenu={handlePaneClick}
            onDuplicateCanvasImage={(imageId) => {
              void handleDuplicateCanvasImage(imageId);
            }}
            onDeleteCanvasImage={(imageId) => {
              void handleDeleteImage(imageId);
            }}
            onImageResizeEnd={handleImageResizeEnd}
            focusCardRef={focusCardRef}
            onImportCanvasImage={handleImportCanvasImage}
          />
        </div>
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
        onClose={() => setIsWizardOpen(false)}
        worldName={worldName}
        cardsById={cardsById}
        links={Object.values(linksById)}
        vaultPath={vaultPath ?? ""}
        onSpawnCard={(card) => {
          void handleSpawnCard(card);
        }}
      />

      <CanvasToolbar
        activeTool={activeTool}
        onCreate={(type) => {
          void addCard(type);
        }}
        onImageTool={() => {
          void handleImageTool();
        }}
        imageToolDisabled={!vaultPath || !isTauriRuntime()}
        onOpenVault={onOpenVault}
        onToggleAllCardViews={() => {
          void toggleAllCardViews();
        }}
        onToggleWizard={() => setIsWizardOpen((open) => !open)}
        isWizardOpen={isWizardOpen}
      />

      <CanvasCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        cardsById={cardsById}
        onJumpToCard={handleNavigateToCard}
      />
    </div>
  );
}
