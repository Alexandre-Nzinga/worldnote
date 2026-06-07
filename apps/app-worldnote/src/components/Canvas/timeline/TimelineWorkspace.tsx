import type {
  CalendarConfig,
  ChronologyEntry,
  WorldCard,
} from "@worldnote/shared";
import {
  AnimatedModal,
  CloseIconButton,
  getBodyTextStyle,
  getHeadingProps,
} from "@worldnote/ui";
import type {
  DataItem,
  TimelineEventPropertiesResult,
  TimelineOptionsItemCallbackFunction,
} from "vis-timeline";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildTimelineItems,
  computeTimelineWindow,
  type TimelineItemKind,
  type TimelineItemPreview,
  type TimelineVisItem,
} from "../../../services/timeline/buildTimelineItems.js";
import {
  coerceTimelineDate,
  dateToYear,
  yearToDate,
} from "../../../services/timeline/calendarFormat.js";
import {
  createTimelineAxisFormat,
  createTimelineOptions,
} from "./timelineOptions.js";
import { TimelineChronologyEditorModal } from "./TimelineChronologyEditorModal.js";
import { TimelineChronologySidebar } from "./TimelineChronologySidebar.js";
import { TimelineItemHoverCard } from "./TimelineItemHoverCard.js";
import {
  computeTimelineHoverCardPosition,
  findTimelineItemElement,
  TIMELINE_HOVER_CARD_HEIGHT,
  TIMELINE_HOVER_CARD_WIDTH,
  TIMELINE_PERIOD_HOVER_CARD_HEIGHT,
} from "./timelineHoverPosition.js";
import { useVisTimeline } from "./useVisTimeline.js";
import { cardImageSrc } from "../../../services/canvas/cardNodeData.js";
import { chronologyItemId } from "../../../services/timeline/timelineChronology.js";
import { RichEmptyState } from "../../ui/RichEmptyState.js";
import "./timeline.css";

const timelineDialogClassName =
  "fixed inset-0 z-modal m-0 flex h-full max-h-none w-full max-w-none items-stretch justify-stretch border-0 bg-transparent p-0";

const timelinePanelClassName =
  "relative z-10 flex h-full w-full max-w-none flex-col overflow-hidden rounded-none border-0 bg-wn-bg p-0 shadow-none";

type TimelineWorkspaceProps = {
  isOpen: boolean;
  onClose: () => void;
  vaultPath: string;
  cardsById: Record<string, WorldCard>;
  chronology: ChronologyEntry[];
  calendarConfig: CalendarConfig;
  onSaveCard: (card: WorldCard) => Promise<void>;
  onSaveChronology: (entry: ChronologyEntry) => Promise<void>;
  onDeleteChronology: (id: string) => Promise<void>;
};

type ItemMeta = {
  itemKind: TimelineItemKind;
  sourceId: string;
  preview: TimelineItemPreview;
};

type TimelineHoverState = {
  itemId: string;
  anchorRect: DOMRect;
};

function toVisItem(item: TimelineVisItem): DataItem {
  return {
    id: item.id,
    content: item.content,
    start: item.start,
    end: item.end,
    type: item.type,
    group: item.group,
    className: item.className,
    style: item.style,
    title: item.title,
  };
}

function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}

export function TimelineWorkspace({
  isOpen,
  onClose,
  vaultPath,
  cardsById,
  chronology,
  calendarConfig,
  onSaveCard,
  onSaveChronology,
  onDeleteChronology,
}: TimelineWorkspaceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const timelineRootRef = useRef<HTMLDivElement>(null);
  const itemMetaRef = useRef<Map<string, ItemMeta>>(new Map());
  const [hoverState, setHoverState] = useState<TimelineHoverState | null>(null);
  const [selectedChronologyId, setSelectedChronologyId] = useState<
    string | null
  >(null);
  const [editorEntry, setEditorEntry] = useState<ChronologyEntry | null>(null);
  const cardsByIdRef = useRef(cardsById);
  const chronologyRef = useRef(chronology);
  const calendarSuffixRef = useRef(calendarConfig.suffix);

  cardsByIdRef.current = cardsById;
  chronologyRef.current = chronology;
  calendarSuffixRef.current = calendarConfig.suffix;

  const timelineData = useMemo(
    () =>
      buildTimelineItems({
        cardsById,
        chronology,
        suffix: calendarConfig.suffix,
      }),
    [calendarConfig.suffix, cardsById, chronology],
  );

  const itemMetaById = useMemo(() => {
    const map = new Map<string, ItemMeta>();
    for (const item of timelineData.items) {
      let preview = item.preview;
      if (item.itemKind === "character" || item.itemKind === "event") {
        const card = cardsById[item.sourceId];
        if (card) {
          preview = {
            ...preview,
            cardType: card.card_type,
            imageUrl: cardImageSrc(vaultPath, card.image_path),
          };
        }
      }

      map.set(item.id, {
        itemKind: item.itemKind,
        sourceId: item.sourceId,
        preview,
      });
    }
    return map;
  }, [cardsById, timelineData.items, vaultPath]);

  const windowRange = useMemo(
    () => computeTimelineWindow(timelineData.items),
    [timelineData.items],
  );

  const persistItemMove = useCallback(
    async (itemId: string, start: Date, end?: Date) => {
      const meta = itemMetaRef.current.get(itemId);
      if (!meta) {
        return;
      }

      const startYear = dateToYear(start);
      const endYear = end ? dateToYear(end) : undefined;

      if (meta.itemKind === "character") {
        const card = cardsByIdRef.current[meta.sourceId];
        if (!card || card.card_type !== "character") {
          return;
        }
        await onSaveCard({
          ...card,
          start_year: startYear,
          end_year: endYear,
        });
        return;
      }

      if (meta.itemKind === "event") {
        const card = cardsByIdRef.current[meta.sourceId];
        if (!card || card.card_type !== "event") {
          return;
        }
        await onSaveCard({
          ...card,
          start_year: startYear,
          end_year: endYear,
        });
        return;
      }

      if (meta.itemKind === "chronology") {
        const entry = chronologyRef.current.find(
          (item) => item.id === meta.sourceId,
        );
        if (!entry || endYear === undefined) {
          return;
        }
        await onSaveChronology({
          ...entry,
          start_year: startYear,
          end_year: endYear,
        });
      }
    },
    [onSaveCard, onSaveChronology],
  );

  const debouncedPersistRef = useRef(
    debounce((itemId: string, start: Date, end?: Date) => {
      void persistItemMove(itemId, start, end);
    }, 350),
  );

  useEffect(() => {
    debouncedPersistRef.current = debounce(
      (itemId: string, start: Date, end?: Date) => {
        void persistItemMove(itemId, start, end);
      },
      350,
    );
  }, [persistItemMove]);

  const handleMoving = useCallback<TimelineOptionsItemCallbackFunction>(
    (item, callback) => {
      const startYear = dateToYear(item.start);
      item.start = yearToDate(startYear);
      if (item.end !== undefined && item.end !== null) {
        item.end = yearToDate(dateToYear(item.end));
      }
      callback(item);
    },
    [],
  );

  const handleMove = useCallback<TimelineOptionsItemCallbackFunction>(
    (item, callback) => {
      callback(item);
      const start = coerceTimelineDate(item.start);
      const end =
        item.end !== undefined && item.end !== null
          ? coerceTimelineDate(item.end)
          : undefined;
      debouncedPersistRef.current(String(item.id), start, end);
    },
    [],
  );

  const windowRangeRef = useRef(windowRange);
  windowRangeRef.current = windowRange;

  const createOptions = useCallback(
    (size: { width: number; height: number }) =>
      createTimelineOptions({
        suffix: calendarSuffixRef.current,
        min: windowRangeRef.current.min,
        max: windowRangeRef.current.max,
        width: size.width,
        height: size.height,
        onMoving: handleMoving,
        onMove: handleMove,
      }),
    [handleMove, handleMoving],
  );

  const { timelineRef, itemsRef, groupsRef, initError, isReady, hostSize } =
    useVisTimeline({
      isOpen,
      mountRef,
      containerRef: timelineRootRef,
      createOptions,
    });

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const itemsDataSet = itemsRef.current;
    const groupsDataSet = groupsRef.current;
    const timeline = timelineRef.current;
    if (!itemsDataSet || !groupsDataSet || !timeline) {
      return;
    }

    const meta = new Map<string, ItemMeta>();
    for (const item of timelineData.items) {
      meta.set(item.id, {
        itemKind: item.itemKind,
        sourceId: item.sourceId,
        preview: item.preview,
      });
    }
    itemMetaRef.current = meta;

    itemsDataSet.clear();
    groupsDataSet.clear();
    if (timelineData.groups.length > 0) {
      groupsDataSet.add(timelineData.groups);
    }
    if (timelineData.items.length > 0) {
      itemsDataSet.add(timelineData.items.map(toVisItem));
    }

    timeline.setOptions({
      min: windowRange.min,
      max: windowRange.max,
      start: windowRange.min,
      end: windowRange.max,
      height: hostSize.height > 0 ? hostSize.height : undefined,
      width: hostSize.width > 0 ? hostSize.width : "100%",
      format: createTimelineAxisFormat(calendarConfig.suffix),
    });
    timeline.redraw();
  }, [
    calendarConfig.suffix,
    hostSize.height,
    hostSize.width,
    isReady,
    itemsRef,
    groupsRef,
    timelineData,
    timelineRef,
    windowRange.max,
    windowRange.min,
  ]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const timeline = timelineRef.current;
    if (!timeline) {
      return;
    }

    const handleItemOver = (properties: TimelineEventPropertiesResult) => {
      if (properties.item == null) {
        return;
      }
      const itemId = String(properties.item);
      if (!itemMetaById.has(itemId)) {
        return;
      }

      const itemElement = findTimelineItemElement(
        properties.event,
        mountRef.current,
      );
      if (!itemElement) {
        return;
      }

      setHoverState({
        itemId,
        anchorRect: itemElement.getBoundingClientRect(),
      });
    };

    const handleItemOut = () => {
      setHoverState(null);
    };

    timeline.on("itemover", handleItemOver);
    timeline.on("itemout", handleItemOut);

    return () => {
      timeline.off("itemover", handleItemOver);
      timeline.off("itemout", handleItemOut);
    };
  }, [isReady, itemMetaById, timelineRef]);

  useEffect(() => {
    if (!isOpen) {
      setHoverState(null);
      setEditorEntry(null);
      setSelectedChronologyId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isReady || !selectedChronologyId) {
      return;
    }
    const timeline = timelineRef.current;
    if (!timeline) {
      return;
    }
    timeline.focus(chronologyItemId(selectedChronologyId), { animation: true });
  }, [isReady, selectedChronologyId, timelineRef]);

  const hoveredItem = hoverState
    ? itemMetaById.get(hoverState.itemId)
    : undefined;

  const hoverCardStyle = useMemo(() => {
    if (!hoverState || !timelineRootRef.current) {
      return undefined;
    }

    const rootRect = timelineRootRef.current.getBoundingClientRect();
    const cardHeight =
      hoveredItem?.itemKind === "chronology"
        ? TIMELINE_PERIOD_HOVER_CARD_HEIGHT
        : TIMELINE_HOVER_CARD_HEIGHT;
    const { left, top } = computeTimelineHoverCardPosition(
      hoverState.anchorRect,
      rootRect,
      TIMELINE_HOVER_CARD_WIDTH,
      cardHeight,
    );

    return {
      position: "absolute" as const,
      left,
      top,
      zIndex: 30,
    };
  }, [hoverState, hoveredItem]);

  const worldName = vaultPath.split(/[/\\]/).pop();

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onClose}
      className={timelineDialogClassName}
      panelClassName={timelinePanelClassName}
      labelledBy="timeline-workspace-title"
      backdropLabel="Close timeline"
    >
      <header className="relative z-10 flex shrink-0 items-center justify-between px-5 py-4">
        <div>
          <h2
            id="timeline-workspace-title"
            {...getHeadingProps("h3", { tone: "inverse" })}
          >
            Timeline
          </h2>
          <p className="mt-0.5" style={getBodyTextStyle("small")}>
            {worldName}
          </p>
        </div>
        <CloseIconButton aria-label="Close timeline" onPress={onClose} />
      </header>

      <div className="relative z-10 flex min-h-0 flex-1">
        <TimelineChronologySidebar
          chronology={chronology}
          suffix={calendarConfig.suffix}
          selectedId={selectedChronologyId}
          onSelect={setSelectedChronologyId}
          onEdit={setEditorEntry}
          onCreate={setEditorEntry}
          onDelete={(id) => {
            void onDeleteChronology(id);
          }}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-4 pr-5">
          <div
            ref={timelineRootRef}
            className="wn-timeline-root relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-wn-border bg-wn-surface"
          >
            <div
              ref={mountRef}
              className="wn-timeline-mount absolute inset-0"
            />

            {hoveredItem && hoverCardStyle ? (
              <TimelineItemHoverCard
                preview={hoveredItem.preview}
                itemKind={hoveredItem.itemKind}
                style={hoverCardStyle}
              />
            ) : null}

            {initError ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-wn-surface/90 p-6">
                <p
                  style={getBodyTextStyle("small")}
                  className="text-wn-text-muted"
                >
                  {initError}
                </p>
              </div>
            ) : null}

            {!initError && isReady && timelineData.items.length === 0 ? (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
                <RichEmptyState
                  title="Nothing on the timeline yet"
                  description="Add time periods in the sidebar, or set birth and start years on character and event cards."
                  className="pointer-events-auto max-w-md shadow-lg"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <TimelineChronologyEditorModal
        isOpen={editorEntry !== null}
        entry={editorEntry}
        chronology={chronology}
        onClose={() => setEditorEntry(null)}
        onSave={onSaveChronology}
      />
    </AnimatedModal>
  );
}
