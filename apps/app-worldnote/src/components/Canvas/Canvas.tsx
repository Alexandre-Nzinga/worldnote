import {
  BondEdge,
  CardNode,
  WorldNoteCanvas,
  type CardFlowNode,
} from "@worldnote/canvas";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { Button } from "@worldnote/ui";
import { useCallback, useMemo, useState } from "react";
import type { DragEvent } from "react";
import { useEffect } from "react";
import { useCardCommands } from "../../hooks/useCardCommands.js";
import { useVault } from "../../hooks/useVault.js";
import { createWorldCard } from "../../services/createWorldCard.js";
import { createCardPositionUpdater } from "../../services/updateCardPosition.js";
import { CanvasHeader } from "./CanvasHeader.js";
import { Sidebar } from "./Sidebar.js";

const nodeTypes = {
  worldnoteCard: CardNode,
};

const edgeTypes = {
  bond: BondEdge,
};

type CanvasProps = {
  onBack: () => void;
};

export function Canvas({ onBack }: CanvasProps) {
  const vaultPath = useVault((state) => state.currentVaultPath);
  const { listCards, loadCanvasManifest } = useCardCommands();
  const [nodes, setNodes] = useState<CardFlowNode[]>([]);

  const edges = useMemo(
    () => [] as { id: string; source: string; target: string; type: string }[],
    [],
  );
  const updateCardPosition = useMemo(() => {
    if (!vaultPath) {
      return null;
    }
    return createCardPositionUpdater(vaultPath);
  }, [vaultPath]);

  useEffect(() => {
    if (!vaultPath) {
      setNodes([]);
      return;
    }

    let isDisposed = false;
    void Promise.all([
      listCards(vaultPath),
      loadCanvasManifest(vaultPath),
    ]).then(([cards, manifest]) => {
      if (isDisposed) {
        return;
      }

      const placementById = new Map(
        manifest.nodes.map((node) => [node.cardId, { x: node.x, y: node.y }]),
      );

      setNodes(
        cards.map((card) => ({
          id: card.id,
          type: "worldnoteCard",
          position: placementById.get(card.id) ?? card.position,
          data: {
            title: card.name,
            subtitle: card.card_type === "character" ? "subtitle" : "Molecule",
            cardType: card.card_type,
          },
        })),
      );
    });

    return () => {
      isDisposed = true;
    };
  }, [listCards, loadCanvasManifest, vaultPath]);

  const addCard = useCallback(
    (
      cardType: "character" | "location",
      position?: { x: number; y: number },
    ) => {
      if (!vaultPath) {
        return Promise.resolve();
      }

      const nextPosition = position ?? {
        x: 120 + nodes.length * 24,
        y: 90 + nodes.length * 20,
      };
      const tempId = crypto.randomUUID();
      const fallbackTitle =
        cardType === "character" ? "New Character" : "New Location";
      const fallbackSubtitle =
        cardType === "character" ? "subtitle" : "Molecule";

      // Optimistic node insertion so create feels instant.
      setNodes((prev) => [
        ...prev,
        {
          id: tempId,
          type: "worldnoteCard",
          position: nextPosition,
          data: {
            title: fallbackTitle,
            subtitle: fallbackSubtitle,
            cardType,
          },
        },
      ]);

      return createWorldCard({
        vault: vaultPath,
        cardType,
        position: nextPosition,
      })
        .then((card) => {
          setNodes((prev) =>
            prev.map((node) =>
              node.id === tempId
                ? {
                    ...node,
                    id: card.id,
                    position: card.position,
                    data: {
                      title: card.name,
                      subtitle:
                        card.card_type === "character"
                          ? "subtitle"
                          : "Molecule",
                      cardType: card.card_type,
                    },
                  }
                : node,
            ),
          );
        })
        .catch((error) => {
          console.error(
            "Failed to persist card, keeping local fallback:",
            error,
          );
        });
    },
    [nodes.length, vaultPath],
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
      ) as "character" | "location";
      if (droppedType !== "character" && droppedType !== "location") {
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

  return (
    <div
      className="flex min-h-screen flex-col gap-3 bg-[#efefef] p-3"
      style={{
        color: "var(--color-wn-mono-900)",
      }}
    >
      <CanvasHeader onBack={onBack} vaultLabel={vaultLabel} />
      <div className="relative flex flex-1 gap-0 overflow-hidden rounded-2xl border border-[#dedede] bg-[#eeeeee]">
        <Sidebar
          className="h-full shrink-0"
          onCreate={(type) => {
            void addCard(type);
          }}
        />
        <ReactFlowProvider>
          <div
            className="h-full w-full p-2"
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <WorldNoteCanvas
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              nodes={nodes}
              edges={edges}
              className="h-full w-full"
              backgroundVariant="dots"
              backgroundColor="#dadada"
              backgroundGap={16}
              onNodeDragStop={(_, node) => {
                if (!updateCardPosition) {
                  return;
                }
                updateCardPosition({
                  cardId: node.id,
                  x: node.position.x,
                  y: node.position.y,
                });
              }}
              fitView
            >
              <CanvasZoomControls />
            </WorldNoteCanvas>
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
}

function CanvasZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-full border border-[#dddddd] bg-white/90 p-1 shadow-sm">
      <Button
        variant="secondary"
        size="sm"
        className="pointer-events-auto h-8 min-h-8 rounded-full border border-[#dcdcdc] bg-white px-2 text-[11px] text-wn-mono-600 data-[hover=true]:bg-[#f1f1f1]"
        onPress={() => fitView({ duration: 150, padding: 0.2 })}
      >
        Fit
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="pointer-events-auto h-8 min-h-8 w-8 rounded-full border border-[#dcdcdc] bg-white px-0 text-base text-wn-mono-700 data-[hover=true]:bg-[#f1f1f1]"
        aria-label="Zoom in"
        onPress={() => zoomIn({ duration: 120 })}
      >
        +
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="pointer-events-auto h-8 min-h-8 w-8 rounded-full border border-[#dcdcdc] bg-white px-0 text-base text-wn-mono-700 data-[hover=true]:bg-[#f1f1f1]"
        aria-label="Zoom out"
        onPress={() => zoomOut({ duration: 120 })}
      >
        -
      </Button>
      <span className="px-1 text-[12px] font-medium text-wn-mono-500">
        100%
      </span>
    </div>
  );
}
