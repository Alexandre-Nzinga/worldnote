import type { CanvasFlowNode, CanvasManifest } from "@worldnote/canvas";
import { StickyNotePlacementSchema } from "@worldnote/shared";
import type { Edge } from "@xyflow/react";
import { useEffect } from "react";
import { canvasNodePosition } from "../flow/canvasNodePosition.js";
import { imagePlacementToFlowNode } from "../../../services/canvas/canvasImageNode.js";
import { worldCardToNodeData } from "../../../services/canvas/cardNodeData.js";
import { isGroupMemberHiddenOnCanvas } from "../../../services/canvas/groupMemberCards.js";
import {
  listStickyNoteMarkdownSafe,
  parseStickyNoteMarkdown,
} from "../../../services/canvas/stickyNoteMarkdown.js";
import {
  stickyNotePlacementToFlowNode,
} from "../../../services/canvas/stickyNoteNode.js";
import { linkToEdge } from "../../../services/links/linkToEdge.js";
import { listLinks } from "../../../services/links/listLinks.js";
import type { Link, WorldCard } from "@worldnote/shared";
import type {
  CardTypeBadgeOverrides,
  KinshipBadgeOverride,
  VisibleSocketsByCardType,
} from "../../../services/settings/settings.js";
import { cardsRecord, linksRecord } from "../helpers/canvasSelectionHelpers.js";

type UseCanvasVaultLoaderOptions = {
  vaultPath: string | null;
  listCards: (vaultPath: string) => Promise<WorldCard[]>;
  loadCanvasManifest: (vaultPath: string) => Promise<CanvasManifest>;
  visibleSocketsSettingsRef: React.RefObject<VisibleSocketsByCardType | undefined>;
  cardTypeBadgeColorsRef: React.RefObject<CardTypeBadgeOverrides | undefined>;
  kinshipLabelColorsRef: React.RefObject<KinshipBadgeOverride | undefined>;
  setNodes: React.Dispatch<React.SetStateAction<CanvasFlowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setCardsById: React.Dispatch<React.SetStateAction<Record<string, WorldCard>>>;
  setLinksById: React.Dispatch<React.SetStateAction<Record<string, Link>>>;
  setSelectedCardIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedImageIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedLinkId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsVaultDataLoaded: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useCanvasVaultLoader({
  vaultPath,
  listCards,
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
}: UseCanvasVaultLoaderOptions) {
  useEffect(() => {
    if (!vaultPath) {
      setIsVaultDataLoaded(false);
      setNodes([]);
      setEdges([]);
      setCardsById({});
      setLinksById({});
      setSelectedCardIds([]);
      setSelectedImageIds([]);
      setSelectedLinkId(null);
      return;
    }

    setIsVaultDataLoaded(false);
    let isDisposed = false;
    void (async () => {
      try {
        const [cards, manifest] = await Promise.all([
          listCards(vaultPath),
          loadCanvasManifest(vaultPath),
        ]);
        if (isDisposed) {
          return;
        }

        let links: Link[] = [];
        try {
          links = await listLinks(vaultPath);
        } catch (linkError) {
          console.warn(
            "Could not load canvas links; cards will still appear:",
            linkError,
          );
        }

        const markdownEntries = await listStickyNoteMarkdownSafe(vaultPath);
        if (isDisposed) {
          return;
        }

        const placementById = new Map(
          manifest.nodes.map((node) => [node.cardId, { x: node.x, y: node.y }]),
        );
        const manifestCardIds = new Set(
          manifest.nodes.map((node) => node.cardId),
        );

        const record = cardsRecord(cards);
        setCardsById(record);
        setLinksById(linksRecord(links));
        const cardNodes: CanvasFlowNode[] = cards.flatMap((card) => {
          if (isGroupMemberHiddenOnCanvas(card, record, manifestCardIds)) {
            return [];
          }
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
                  visibleSocketsSettings: visibleSocketsSettingsRef.current,
                  cardTypeBadgeColors: cardTypeBadgeColorsRef.current,
                  kinshipLabelColors: kinshipLabelColorsRef.current,
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
        const markdownById = new Map(
          markdownEntries.map((entry) => {
            const parsed = parseStickyNoteMarkdown(entry.content);
            return [
              entry.id,
              {
                heading: parsed.heading ?? undefined,
                content: parsed.content,
              },
            ] as const;
          }),
        );
        const noteNodes: CanvasFlowNode[] = (manifest.stickyNotes ?? []).flatMap(
          (note) => {
            try {
              const markdown = markdownById.get(note.id);
              const placement = StickyNotePlacementSchema.parse({
                ...note,
                heading: note.heading ?? markdown?.heading,
              });
              return [
                stickyNotePlacementToFlowNode(
                  placement,
                  markdown?.content ?? "",
                  {},
                ),
              ];
            } catch (error) {
              console.error(
                `Skipping sticky note ${note.id} on canvas load:`,
                error,
              );
              return [];
            }
          },
        );
        setNodes([...cardNodes, ...imageNodes, ...noteNodes]);
        setEdges(links.map(linkToEdge));
      } catch (error) {
        console.error("Failed to load canvas:", error);
      } finally {
        if (!isDisposed) {
          setIsVaultDataLoaded(true);
        }
      }
    })();

    return () => {
      isDisposed = true;
    };
  }, [
    cardTypeBadgeColorsRef,
    kinshipLabelColorsRef,
    listCards,
    loadCanvasManifest,
    setCardsById,
    setEdges,
    setIsVaultDataLoaded,
    setLinksById,
    setNodes,
    setSelectedCardIds,
    setSelectedImageIds,
    setSelectedLinkId,
    vaultPath,
    visibleSocketsSettingsRef,
  ]);
}
