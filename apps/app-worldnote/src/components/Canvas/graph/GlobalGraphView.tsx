import type { Link, WorldCard } from "@worldnote/shared";
import {
  AnimatedModal,
  CloseIconButton,
  getBodyTextStyle,
  getHeadingProps,
} from "@worldnote/ui";
import { useSettings } from "../../../hooks/useSettings.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVault } from "../../../hooks/useVault.js";
import { searchCardIndex } from "../../../services/cards/searchCardIndex.js";
import ForceGraph2D, {
  type ForceGraphMethods,
  type NodeObject,
} from "react-force-graph-2d";
import {
  buildGraphData,
  type GraphNode,
} from "../../../services/graph/buildGraphData.js";
import type { CanvasAttachmentRef } from "../../../services/graph/filterGraphData.js";
import { filterGraphData } from "../../../services/graph/filterGraphData.js";
import {
  cardTypeColor,
  graphAttachmentColor,
  graphLabelColor,
  graphTagLabelColor,
} from "../../../services/graph/cardTypeColor.js";
import { RichEmptyState } from "../../ui/RichEmptyState.js";
import { pageBackdropClassName } from "../../shell/pageShellStyles.js";
import { GraphViewSidebar } from "./GraphViewSidebar.js";
import {
  DEFAULT_GRAPH_DISPLAY_SETTINGS,
  type GraphDisplaySettings,
} from "./graphDisplaySettings.js";
import {
  DEFAULT_GRAPH_FILTER_SETTINGS,
  type GraphFilterSettings,
} from "./graphFilterSettings.js";
import {
  DEFAULT_GRAPH_FORCE_SETTINGS,
  type GraphForceSettings,
} from "./graphForceSettings.js";
import { applyGraphForceSettings } from "../../../services/graph/applyGraphForceSettings.js";

const GRAPH_BACKGROUND = "transparent";
const LABEL_FONT_WEIGHT = 500;
const LABEL_FONT_SIZE_PX = 12;
const TAG_FONT_SIZE_PX = 10;
const LABEL_OFFSET_PX = 6;
const TAG_LINE_HEIGHT_PX = 12;
const LINK_ARROW_LENGTH = 4;

const graphDialogClassName =
  "fixed inset-0 z-modal m-0 flex h-full max-h-none w-full max-w-none items-stretch justify-stretch border-0 bg-transparent p-0";

const graphPanelClassName =
  "relative z-10 flex h-full w-full max-w-none flex-col overflow-hidden rounded-none border-0 bg-wn-bg p-0 shadow-none";

const graphCanvasBackdropClassName =
  "pointer-events-none absolute inset-0 bg-wn-bg [background-image:radial-gradient(circle,var(--color-wn-mono-800)_1px,transparent_1px)] [background-size:22px_22px]";

type GlobalGraphViewProps = {
  isOpen: boolean;
  onClose: () => void;
  cardsById: Record<string, WorldCard>;
  links: Link[];
  canvasCardIds: ReadonlySet<string>;
  canvasAttachments: readonly CanvasAttachmentRef[];
  onNavigateToCard: (cardId: string) => void;
  onAddCharacter?: () => void;
};

function isGraphNode(node: NodeObject): node is GraphNode & NodeObject {
  return (
    typeof node.id === "string" &&
    typeof node.label === "string" &&
    (node.kind === "card" || node.kind === "attachment")
  );
}

export function GlobalGraphView({
  isOpen,
  onClose,
  cardsById,
  links,
  canvasCardIds,
  canvasAttachments,
  onNavigateToCard,
  onAddCharacter,
}: GlobalGraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphMethods<GraphNode, unknown> | undefined>(
    undefined,
  );
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [displaySettings, setDisplaySettings] = useState<GraphDisplaySettings>(
    DEFAULT_GRAPH_DISPLAY_SETTINGS,
  );
  const [filterSettings, setFilterSettings] = useState<GraphFilterSettings>(
    DEFAULT_GRAPH_FILTER_SETTINGS,
  );
  const [forceSettings, setForceSettings] = useState<GraphForceSettings>(
    DEFAULT_GRAPH_FORCE_SETTINGS,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCardIds, setSearchCardIds] = useState<ReadonlySet<string> | null>(
    null,
  );
  const vaultPath = useVault((state) => state.currentVaultPath);
  const cardTypeBadgeColors = useSettings(
    (state) => state.settings?.cardTypeBadgeColors,
  );

  useEffect(() => {
    if (!isOpen) {
      setSearchCardIds(null);
      return;
    }

    const trimmed = searchQuery.trim();
    if (!trimmed || !vaultPath?.trim()) {
      setSearchCardIds(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void searchCardIndex(vaultPath, trimmed, 500)
        .then((hits) => {
          if (cancelled) {
            return;
          }
          setSearchCardIds(new Set(hits.map((hit) => hit.id)));
        })
        .catch(() => {
          if (!cancelled) {
            setSearchCardIds(new Set());
          }
        });
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isOpen, searchQuery, vaultPath]);

  const graphData = useMemo(() => {
    const built = buildGraphData(Object.values(cardsById), links);
    return filterGraphData(built, {
      searchQuery,
      searchCardIds,
      showAttachments: filterSettings.showAttachments,
      canvasCardsOnly: filterSettings.canvasCardsOnly,
      showOrphans: filterSettings.showOrphans,
      canvasCardIds,
      canvasAttachments,
    });
  }, [
    cardsById,
    links,
    searchQuery,
    searchCardIds,
    filterSettings,
    canvasCardIds,
    canvasAttachments,
  ]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) {
      return;
    }
    const element = containerRef.current;
    const updateSize = () => {
      setDimensions({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const timer = window.setTimeout(() => {
      graphRef.current?.zoomToFit(400, 48);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const handleNodeClick = useCallback(
    (node: NodeObject) => {
      if (!isGraphNode(node) || node.kind !== "card") {
        return;
      }
      onNavigateToCard(node.id);
      onClose();
    },
    [onClose, onNavigateToCard],
  );

  const handleDisplaySettingsChange = useCallback(
    (patch: Partial<GraphDisplaySettings>) => {
      setDisplaySettings((current) => ({ ...current, ...patch }));
    },
    [],
  );

  const handleFilterSettingsChange = useCallback(
    (patch: Partial<GraphFilterSettings>) => {
      setFilterSettings((current) => ({ ...current, ...patch }));
    },
    [],
  );

  const handleForceSettingsChange = useCallback(
    (patch: Partial<GraphForceSettings>) => {
      setForceSettings((current) => ({ ...current, ...patch }));
    },
    [],
  );

  const handleAnimate = useCallback(() => {
    graphRef.current?.d3ReheatSimulation();
  }, []);

  useEffect(() => {
    if (
      !isOpen ||
      dimensions.width === 0 ||
      dimensions.height === 0 ||
      !graphRef.current
    ) {
      return;
    }
    applyGraphForceSettings(graphRef.current, forceSettings);
  }, [forceSettings, isOpen, dimensions.width, dimensions.height]);

  const paintNode = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      if (
        !isGraphNode(node) ||
        globalScale < displaySettings.textFadeThreshold
      ) {
        return;
      }
      const label = node.label;
      const fontSize = LABEL_FONT_SIZE_PX / globalScale;
      ctx.font = `${LABEL_FONT_WEIGHT} ${fontSize}px "Urbanist", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const x = node.x ?? 0;
      const y = (node.y ?? 0) + LABEL_OFFSET_PX;
      ctx.fillStyle = graphLabelColor();
      ctx.fillText(label, x, y);

      if (
        node.kind === "card" &&
        filterSettings.showTags &&
        node.tags.length > 0
      ) {
        const tagFontSize = TAG_FONT_SIZE_PX / globalScale;
        ctx.font = `${LABEL_FONT_WEIGHT} ${tagFontSize}px "Urbanist", sans-serif`;
        ctx.fillStyle = graphTagLabelColor();
        ctx.fillText(node.tags.join(", "), x, y + TAG_LINE_HEIGHT_PX / globalScale);
      }
    },
    [displaySettings.textFadeThreshold, filterSettings.showTags],
  );

  const nodeColor = useCallback((node: NodeObject) => {
    if (!isGraphNode(node)) {
      return cardTypeColor(undefined);
    }
    if (node.kind === "attachment") {
      return graphAttachmentColor();
    }
    return cardTypeColor(node.cardType, cardTypeBadgeColors);
  }, [cardTypeBadgeColors]);

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      className={graphDialogClassName}
      panelClassName={graphPanelClassName}
      backdropLabel="Close graph view"
    >
      <div aria-hidden className={pageBackdropClassName} />
      <header className="relative z-10 flex shrink-0 items-center justify-between px-5 py-4">
        <div>
          <h2 {...getHeadingProps("h3", { tone: "inverse" })}>Graph view</h2>
          <p className="mt-0.5" style={getBodyTextStyle("small")}>
            {graphData.nodes.length} cards · {graphData.links.length} connections
          </p>
        </div>
        <CloseIconButton aria-label="Close graph view" onPress={onClose} />
      </header>

      <div className="relative z-10 flex min-h-0 flex-1">
        <GraphViewSidebar
          displaySettings={displaySettings}
          filterSettings={filterSettings}
          forceSettings={forceSettings}
          searchQuery={searchQuery}
          onDisplaySettingsChange={handleDisplaySettingsChange}
          onFilterSettingsChange={handleFilterSettingsChange}
          onForceSettingsChange={handleForceSettingsChange}
          onSearchQueryChange={setSearchQuery}
          onAnimate={handleAnimate}
        />

        <div ref={containerRef} className="relative min-h-0 min-w-0 flex-1">
          <div aria-hidden className={graphCanvasBackdropClassName} />
          {links.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
              <RichEmptyState
                title="No connections yet"
                description={
                  Object.keys(cardsById).length === 0
                    ? "Add a character on the canvas, then drag between card sockets to build your graph."
                    : "Drag from a card socket to another card on the canvas to create your first link."
                }
                actions={
                  onAddCharacter
                    ? [
                        {
                          label: "Add Character",
                          icon: "person",
                          variant: "white",
                          onPress: () => {
                            onClose();
                            onAddCharacter();
                          },
                        },
                      ]
                    : []
                }
                className="pointer-events-auto max-w-md shadow-lg"
              />
            </div>
          ) : null}
          {dimensions.width > 0 && dimensions.height > 0 ? (
            <ForceGraph2D
              ref={graphRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              backgroundColor={GRAPH_BACKGROUND}
              nodeRelSize={displaySettings.nodeSize}
              nodeColor={nodeColor}
              linkColor={() => "rgba(255,255,255,0.12)"}
              linkWidth={displaySettings.linkThickness}
              linkDirectionalArrowLength={
                displaySettings.showArrows ? LINK_ARROW_LENGTH : 0
              }
              linkDirectionalArrowColor={() => "rgba(255,255,255,0.35)"}
              nodeCanvasObjectMode={() => "after"}
              nodeCanvasObject={paintNode}
              onNodeClick={handleNodeClick}
              cooldownTicks={120}
              onEngineStop={() => graphRef.current?.zoomToFit(400, 48)}
            />
          ) : null}
        </div>
      </div>
    </AnimatedModal>
  );
}
