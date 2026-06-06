import type { CanvasFlowNode } from "@worldnote/canvas";
import type { Edge } from "@xyflow/react";
import { useCallback, useEffect, useRef } from "react";
import { imagePlacementToFlowNode } from "../../../services/canvas/canvasImageNode.js";
import { cardNodeSaveCallbacks, worldCardToNodeData } from "../../../services/canvas/cardNodeData.js";
import {
  captureCanvasHistorySnapshot,
  restoreCanvasHistorySnapshot,
  useCanvasHistoryStore,
  type CanvasHistorySnapshot,
} from "../../../services/canvas/canvasHistory.js";
import { linkToEdge } from "../../../services/links/linkToEdge.js";
import type { Link, WorldCard } from "@worldnote/shared";
import type {
  CardTypeBadgeOverrides,
  VisibleSocketsByCardType,
} from "../../../services/settings/settings.js";
import type { CanvasImageContextMenuState } from "../context-menus/CanvasImageContextMenu.js";
import { cardsRecord, linksRecord } from "../helpers/canvasSelectionHelpers.js";

type UseCanvasHistoryOptions = {
  vaultPath: string | null;
  nodesRef: React.RefObject<CanvasFlowNode[]>;
  cardsByIdRef: React.RefObject<Record<string, WorldCard>>;
  linksByIdRef: React.RefObject<Record<string, Link>>;
  visibleSocketsSettingsRef: React.RefObject<VisibleSocketsByCardType | undefined>;
  cardTypeBadgeColorsRef: React.RefObject<CardTypeBadgeOverrides | undefined>;
  handleSaveCardRef: React.RefObject<
    (card: WorldCard, options?: { notify?: boolean }) => Promise<void>
  >;
  setNodes: React.Dispatch<React.SetStateAction<CanvasFlowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setCardsById: React.Dispatch<React.SetStateAction<Record<string, WorldCard>>>;
  setLinksById: React.Dispatch<React.SetStateAction<Record<string, Link>>>;
  setSelectedCardIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedImageIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedLinkId: React.Dispatch<React.SetStateAction<string | null>>;
  setImageContextMenu: React.Dispatch<
    React.SetStateAction<CanvasImageContextMenuState | null>
  >;
};

export function useCanvasHistory({
  vaultPath,
  nodesRef,
  cardsByIdRef,
  linksByIdRef,
  visibleSocketsSettingsRef,
  cardTypeBadgeColorsRef,
  handleSaveCardRef,
  setNodes,
  setEdges,
  setCardsById,
  setLinksById,
  setSelectedCardIds,
  setSelectedImageIds,
  setSelectedLinkId,
  setImageContextMenu,
}: UseCanvasHistoryOptions) {
  const isApplyingHistoryRef = useRef(false);
  const skipHistoryPushRef = useRef(false);
  const dragHistoryPushedRef = useRef(false);

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
  }, [cardsByIdRef, linksByIdRef, nodesRef, vaultPath]);

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

        const snapshotCanvasCardIds = new Set(
          snapshot.canvasCardIds ?? snapshot.cards.map((card) => card.id),
        );
        const cardNodes: CanvasFlowNode[] = snapshot.cards.flatMap((card) => {
          if (!snapshotCanvasCardIds.has(card.id)) {
            return [];
          }
          return [
            {
              id: card.id,
              type: "worldnoteCard",
              position: card.position,
              data: worldCardToNodeData(card, vaultPath, {
                visibleSocketsSettings: visibleSocketsSettingsRef.current,
                cardTypeBadgeColors: cardTypeBadgeColorsRef.current,
                links,
                cardsById: record,
                ...cardNodeSaveCallbacks(card, (nextCard, options) =>
                  handleSaveCardRef.current(nextCard, options),
                ),
              }),
            },
          ];
        });
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
    [
      cardTypeBadgeColorsRef,
      handleSaveCardRef,
      linksByIdRef,
      nodesRef,
      setCardsById,
      setEdges,
      setImageContextMenu,
      setLinksById,
      setNodes,
      setSelectedCardIds,
      setSelectedImageIds,
      setSelectedLinkId,
      vaultPath,
      visibleSocketsSettingsRef,
    ],
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

  const runWithoutHistoryPush = useCallback(
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

  useEffect(() => {
    void vaultPath;
    useCanvasHistoryStore.getState().reset();
  }, [vaultPath]);

  return {
    pushCanvasHistory,
    handleHistoryUndo,
    handleHistoryRedo,
    runWithoutHistoryPush,
    dragHistoryPushedRef,
  };
}
