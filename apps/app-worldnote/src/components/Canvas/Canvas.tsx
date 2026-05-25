import {
  canonicalSocketId,
  CardNode,
  LinkEdge,
  type CardFlowNode,
} from "@worldnote/canvas";
import {
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
import type { DragEvent } from "react";
import { useCardCommands } from "../../hooks/useCardCommands.js";
import { useSettings } from "../../hooks/useSettings.js";
import { useVault } from "../../hooks/useVault.js";
import { worldCardToNodeData } from "../../services/canvas/cardNodeData.js";
import { createCardPositionUpdater } from "../../services/canvas/updateCardPosition.js";
import { createWorldCard } from "../../services/crudWorldCard/createWorldCard.js";
import type { NewCardType } from "../../services/crudWorldCard/cardTemplates.js";
import { deleteWorldCard } from "../../services/crudWorldCard/deleteWorldCard.js";
import { updateWorldCard } from "../../services/crudWorldCard/updateWorldCard.js";
import { createLink } from "../../services/links/createLink.js";
import { deleteLink } from "../../services/links/deleteLink.js";
import { linkToEdge } from "../../services/links/linkToEdge.js";
import { listLinks } from "../../services/links/listLinks.js";
import { LinkEditorPanel } from "./LinkEditorPanel.js";
import { CardEditorPanel } from "./CardEditorPanel.js";
import { CanvasFlow } from "./CanvasFlow.js";
import { CanvasToolbar } from "./CanvasToolbar.js";
import { useCanvasDeleteShortcut } from "./useCanvasDeleteShortcut.js";
import {
  isValidEasyConnection,
  normalizeConnection,
} from "../../services/links/resolveEasyConnect.js";

const nodeTypes = {
  worldnoteCard: CardNode,
};

const edgeTypes: EdgeTypes = {
  link: LinkEdge,
};

type CanvasProps = {
  onBack: () => void;
};

function cardsRecord(cards: WorldCard[]): Record<string, WorldCard> {
  return Object.fromEntries(cards.map((card) => [card.id, card]));
}

function linksRecord(links: Link[]): Record<string, Link> {
  return Object.fromEntries(links.map((link) => [link.id, link]));
}

export function Canvas({ onBack }: CanvasProps) {
  const vaultPath = useVault((state) => state.currentVaultPath);
  const visibleSocketsSettings = useSettings(
    (state) => state.settings?.visibleSockets,
  );
  const { listCards, loadCanvasManifest } = useCardCommands();
  const [nodes, setNodes, onNodesChange] = useNodesState<CardFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [cardsById, setCardsById] = useState<Record<string, WorldCard>>({});
  const [linksById, setLinksById] = useState<Record<string, Link>>({});
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const cardsByIdRef = useRef(cardsById);
  cardsByIdRef.current = cardsById;

  const linksByIdRef = useRef(linksById);
  linksByIdRef.current = linksById;

  const visibleSocketsSettingsRef = useRef(visibleSocketsSettings);
  visibleSocketsSettingsRef.current = visibleSocketsSettings;

  const handleNodesChange: OnNodesChange<Node> = useCallback(
    (changes) => {
      onNodesChange(changes as NodeChange<CardFlowNode>[]);
    },
    [onNodesChange],
  );

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      const selectedEdge = selectedEdges[0];
      if (selectedEdge) {
        setSelectedLinkId(selectedEdge.id);
        setSelectedCardId(null);
        return;
      }

      const selected = selectedNodes.find(
        (node) => node.type === "worldnoteCard",
      );
      setSelectedCardId(selected?.id ?? null);
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

  const handleSaveCardRef = useRef(handleSaveCard);
  handleSaveCardRef.current = handleSaveCard;

  const applyNodeDataFromCards = useCallback(() => {
    if (!vaultPath) {
      return;
    }
    const cards = cardsByIdRef.current;
    const links = Object.values(linksById);
    setNodes((prev) =>
      prev.map((node) => {
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
      setSelectedCardId(null);
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
        setNodes(
          cards.map((card) => ({
            id: card.id,
            type: "worldnoteCard",
            position: placementById.get(card.id) ?? card.position,
            data: worldCardToNodeData(card, vaultPath, {
              visibleSocketsSettings,
              links,
              cardsById: record,
            }),
          })),
        );
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

  const linksList = useMemo(
    () => Object.values(linksById),
    [linksById],
  );

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
          setSelectedCardId(null);
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
          setSelectedCardId(card.id);
          setSelectedLinkId(null);
        })
        .catch((error) => {
          console.error("Failed to persist card:", error);
          setNodes((prev) => prev.filter((node) => node.id !== tempId));
        });
    },
    [cardsById, linksById, nodes.length, setNodes, vaultPath, visibleSocketsSettings],
  );

  const handleDeleteCard = useCallback(
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
          if (
            link.source_card === cardId ||
            link.target_card === cardId
          ) {
            delete next[linkId];
          }
        }
        return next;
      });
      setNodes((prev) => prev.filter((node) => node.id !== cardId));
      setEdges((prev) =>
        prev.filter(
          (edge) => edge.source !== cardId && edge.target !== cardId,
        ),
      );
      setSelectedCardId((current) => (current === cardId ? null : current));
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

  const handleDeleteLink = useCallback(
    async (linkId: string) => {
      if (!vaultPath) {
        return;
      }
      await deleteLink(vaultPath, linkId);
      setLinksById((prev) => {
        const next = { ...prev };
        delete next[linkId];
        return next;
      });
      setEdges((prev) => prev.filter((edge) => edge.id !== linkId));
      setSelectedLinkId((current) => (current === linkId ? null : current));
    },
    [setEdges, vaultPath],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    if (!event.dataTransfer.types.includes("application/worldnote-card-type")) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!vaultPath) {
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
    [addCard, vaultPath],
  );

  const vaultLabel = useMemo(() => {
    if (!vaultPath) {
      return "No vault selected";
    }
    const name = vaultPath.split(/[/\\]/).pop();
    return name ? `Vault: ${name}` : "Vault";
  }, [vaultPath]);

  const selectedCard = selectedCardId ? cardsById[selectedCardId] : null;
  const selectedLink = selectedLinkId ? linksById[selectedLinkId] : null;

  useCanvasDeleteShortcut({
    selectedCardId,
    selectedLinkId,
    onDeleteCard: handleDeleteCard,
    onDeleteLink: handleDeleteLink,
  });

  return (
    <div className="relative h-screen min-h-0 bg-wn-mono-950 text-wn-mono-100">
      <ReactFlowProvider>
        <div
          className="h-full w-full"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
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
            vaultPath={vaultPath}
            cardsByIdRef={cardsByIdRef}
            linksByIdRef={linksByIdRef}
            visibleSocketsSettingsRef={visibleSocketsSettingsRef}
            setNodes={setNodes}
            setEdges={setEdges}
            setCardsById={setCardsById}
            setLinksById={setLinksById}
            setSelectedCardId={setSelectedCardId}
            setSelectedLinkId={setSelectedLinkId}
            onNodeDragStop={(_, node) => {
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
              setSelectedCardId(node.id);
              setSelectedLinkId(null);
            }}
            onEdgeDoubleClick={(_, edge) => {
              setSelectedLinkId(edge.id);
              setSelectedCardId(null);
            }}
          />
        </div>
      </ReactFlowProvider>

      <CardEditorPanel
        isOpen={Boolean(selectedCard && vaultPath && !selectedLink)}
        card={selectedCard ?? undefined}
        vaultPath={vaultPath ?? ""}
        links={Object.values(linksById)}
        cardsById={cardsById}
        onClose={() => setSelectedCardId(null)}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      <LinkEditorPanel
        isOpen={Boolean(selectedLink && vaultPath && !selectedCard)}
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

      <CanvasToolbar
        vaultLabel={vaultLabel}
        onBack={onBack}
        onCreate={(type) => {
          void addCard(type);
        }}
      />
    </div>
  );
}
