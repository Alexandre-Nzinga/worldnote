import {
  useReactFlow,
  type Connection,
  type Edge,
  type FinalConnectionState,
  type NodeMouseHandler,
  type OnConnect,
  type OnConnectEnd,
  type OnConnectStart,
} from "@xyflow/react";
import { useCallback, useRef, type RefObject } from "react";
import type { CanvasFlowNode, CardFlowNode } from "@worldnote/canvas";
import type { Link, WorldCard } from "@worldnote/shared";
import {
  AUTO_CREATE_CHARACTER_SOCKETS,
  contextualCharacterName,
} from "../../services/links/characterFromSocketDrop.js";
import {
  canEasyConnect,
  connectOriginFromHandle,
  resolveEasyConnect,
  type ConnectDragOrigin,
} from "../../services/links/resolveEasyConnect.js";
import { createLink } from "../../services/links/createLink.js";
import { linkToEdge } from "../../services/links/linkToEdge.js";
import { worldCardToNodeData } from "../../services/canvas/cardNodeData.js";
import { createWorldCard } from "../../services/crudWorldCard/createWorldCard.js";
import type { VisibleSocketsByCardType } from "../../services/settings/settings.js";

type UseCanvasConnectionEndOptions = {
  vaultPath: string | null;
  cardsByIdRef: RefObject<Record<string, WorldCard>>;
  linksByIdRef: RefObject<Record<string, Link>>;
  visibleSocketsSettingsRef: RefObject<VisibleSocketsByCardType | undefined>;
  onConnect: OnConnect;
  setNodes: React.Dispatch<React.SetStateAction<CanvasFlowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setCardsById: React.Dispatch<React.SetStateAction<Record<string, WorldCard>>>;
  setLinksById: React.Dispatch<React.SetStateAction<Record<string, Link>>>;
  setSelectedCardIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedLinkId: React.Dispatch<React.SetStateAction<string | null>>;
  setInspectorMode: React.Dispatch<React.SetStateAction<"read" | "edit">>;
};

function pointerFromEvent(event: MouseEvent | TouchEvent): {
  x: number;
  y: number;
} {
  if ("changedTouches" in event && event.changedTouches.length > 0) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    };
  }
  return { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY };
}

function findDropTargetCardId(
  event: MouseEvent | TouchEvent,
  connectionState: FinalConnectionState,
  origin: ConnectDragOrigin,
  screenToFlowPosition: (position: { x: number; y: number }) => {
    x: number;
    y: number;
  },
  getIntersectingNodes: (
    nodeOrRect: { x: number; y: number; width: number; height: number },
    partially?: boolean,
  ) => CanvasFlowNode[],
): string | null {
  const originCardId =
    origin.kind === "socket" ? origin.ownerCardId : origin.cardId;

  const position = screenToFlowPosition(pointerFromEvent(event));
  const hits = getIntersectingNodes(
    { x: position.x, y: position.y, width: 1, height: 1 },
    true,
  );
  const cards = hits.filter(
    (node) => node.type === "worldnoteCard" && node.id !== originCardId,
  );
  if (cards.length > 0) {
    return cards[0]?.id ?? null;
  }

  const hovered =
    connectionState.toNode?.type === "worldnoteCard"
      ? connectionState.toNode.id
      : null;
  if (hovered && hovered !== originCardId) {
    return hovered;
  }

  return null;
}

export function useCanvasConnectionEnd({
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
}: UseCanvasConnectionEndOptions) {
  const { screenToFlowPosition, getIntersectingNodes } =
    useReactFlow<CanvasFlowNode>();
  const dragOriginRef = useRef<ConnectDragOrigin | null>(null);
  const isConnectingRef = useRef(false);

  const clearConnectHover = useCallback(() => {
    isConnectingRef.current = false;
    setNodes((prev) =>
      prev.map((node) => {
        if (node.type !== "worldnoteCard" || !node.data.connectionHover) {
          return node;
        }
        return {
          ...node,
          data: { ...node.data, connectionHover: false },
        };
      }),
    );
  }, [setNodes]);

  const setConnectHover = useCallback(
    (cardId: string | null) => {
      setNodes((prev) =>
        prev.map((node) => {
          if (node.type !== "worldnoteCard") {
            return node;
          }
          const hover = cardId !== null && node.id === cardId;
          if (Boolean(node.data.connectionHover) === hover) {
            return node;
          }
          return { ...node, data: { ...node.data, connectionHover: hover } };
        }),
      );
    },
    [setNodes],
  );

  const onConnectStart: OnConnectStart = useCallback(
    (_, { nodeId, handleId, handleType }) => {
      dragOriginRef.current = null;
      isConnectingRef.current = false;
      clearConnectHover();
      if (!nodeId || !handleId) {
        return;
      }
      const origin = connectOriginFromHandle(nodeId, handleId, handleType);
      if (!origin) {
        return;
      }
      dragOriginRef.current = origin;
      isConnectingRef.current = true;
    },
    [clearConnectHover],
  );

  const onNodeMouseEnter: NodeMouseHandler<CardFlowNode> = useCallback(
    (_, node) => {
      if (!isConnectingRef.current || node.type !== "worldnoteCard") {
        return;
      }
      const origin = dragOriginRef.current;
      if (!origin) {
        return;
      }
      const cardsById = cardsByIdRef.current;
      if (!canEasyConnect(origin, node.id, cardsById)) {
        setConnectHover(null);
        return;
      }
      setConnectHover(node.id);
    },
    [cardsByIdRef, setConnectHover],
  );

  const onNodeMouseLeave: NodeMouseHandler<CardFlowNode> = useCallback(
    (_, node) => {
      if (!isConnectingRef.current) {
        return;
      }
      setNodes((prev) =>
        prev.map((n) => {
          if (
            n.id !== node.id ||
            n.type !== "worldnoteCard" ||
            !n.data.connectionHover
          ) {
            return n;
          }
          return { ...n, data: { ...n.data, connectionHover: false } };
        }),
      );
    },
    [setNodes],
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState: FinalConnectionState) => {
      const origin = dragOriginRef.current;
      dragOriginRef.current = null;
      clearConnectHover();

      if (connectionState.isValid === true) {
        return;
      }

      if (!origin || !vaultPath) {
        return;
      }

      const cardsById = cardsByIdRef.current;
      const dropCardId = findDropTargetCardId(
        event,
        connectionState,
        origin,
        screenToFlowPosition,
        getIntersectingNodes,
      );

      if (dropCardId) {
        const easy = resolveEasyConnect(origin, dropCardId, cardsById, {
          links: Object.values(linksByIdRef.current),
        });
        if (easy) {
          onConnect(easy);
          return;
        }
      }

      if (origin.kind !== "socket") {
        return;
      }

      if (!AUTO_CREATE_CHARACTER_SOCKETS.has(origin.socketId)) {
        return;
      }

      const sourceCard = cardsById[origin.ownerCardId];
      if (!sourceCard || sourceCard.card_type !== "character") {
        return;
      }

      const position = screenToFlowPosition(pointerFromEvent(event));
      const name = contextualCharacterName(origin.socketId, sourceCard.name);
      const tempNodeId = crypto.randomUUID();
      const tempEdgeId = crypto.randomUUID();

      setNodes((prev) => [
        ...prev,
        {
          id: tempNodeId,
          type: "worldnoteCard",
          position,
          data: {
            title: name,
            subtitle: "Character",
            cardType: "character",
            enterAnimation: true,
          },
        },
      ]);

      setEdges((prev) => [
        ...prev,
        {
          id: tempEdgeId,
          source: tempNodeId,
          target: sourceCard.id,
          targetHandle: origin.socketId,
          type: "link",
          data: { sourceSocket: origin.socketId },
        },
      ]);

      void createWorldCard({
        vault: vaultPath,
        cardType: "character",
        position,
        name,
      })
        .then((newCard) => {
          setCardsById((prev) => ({ ...prev, [newCard.id]: newCard }));
          const links = Object.values(linksByIdRef.current);
          const cards = { ...cardsByIdRef.current, [newCard.id]: newCard };

          setNodes((prev) =>
            prev.map((node) => {
              if (node.id === tempNodeId) {
                return {
                  id: newCard.id,
                  type: "worldnoteCard",
                  position: newCard.position,
                  data: worldCardToNodeData(newCard, vaultPath, {
                    visibleSocketsSettings: visibleSocketsSettingsRef.current,
                    links,
                    cardsById: cards,
                  }),
                };
              }
              return node;
            }),
          );

          setEdges((prev) =>
            prev.map((edge) =>
              edge.id === tempEdgeId
                ? {
                    ...edge,
                    id: tempEdgeId,
                    source: newCard.id,
                    target: sourceCard.id,
                    targetHandle: origin.socketId,
                  }
                : edge,
            ),
          );

          return createLink({
            vault: vaultPath,
            sourceCard,
            sourceSocket: origin.socketId,
            targetCard: newCard,
          }).then((link) => ({ link, newCard }));
        })
        .then((result) => {
          if (!result) {
            return;
          }
          const { link, newCard } = result;
          setLinksById((prev) => ({ ...prev, [link.id]: link }));
          setEdges((prev) =>
            prev.map((edge) =>
              edge.id === tempEdgeId ? linkToEdge(link) : edge,
            ),
          );
          setSelectedLinkId(link.id);
          setSelectedCardIds([newCard.id]);
          setInspectorMode("edit");
        })
        .catch((error) => {
          console.error("Failed to create character from socket drop:", error);
          setNodes((prev) => prev.filter((node) => node.id !== tempNodeId));
          setEdges((prev) => prev.filter((edge) => edge.id !== tempEdgeId));
        });
    },
    [
      cardsByIdRef,
      clearConnectHover,
      getIntersectingNodes,
      linksByIdRef,
      onConnect,
      screenToFlowPosition,
      setCardsById,
      setEdges,
      setLinksById,
      setNodes,
      setSelectedCardIds,
      setSelectedLinkId,
      setInspectorMode,
      vaultPath,
      visibleSocketsSettingsRef,
    ],
  );

  return {
    onConnectStart,
    onConnectEnd,
    onNodeMouseEnter,
    onNodeMouseLeave,
  };
}
