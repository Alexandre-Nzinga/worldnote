import type { CalendarConfig, Era, Period, WorldCard } from "@worldnote/shared";
import {
  AnimatedModal,
  CloseIconButton,
  getBodyTextStyle,
  getHeadingProps,
} from "@worldnote/ui";
import type { DataItem, TimelineOptionsItemCallbackFunction } from "vis-timeline";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { pageBackdropClassName } from "../../shell/pageShellStyles.js";
import {
  buildTimelineItems,
  computeTimelineWindow,
  type TimelineItemKind,
  type TimelineVisItem,
} from "../../../services/timeline/buildTimelineItems.js";
import { coerceTimelineDate, dateToYear, formatYear, yearToDate } from "../../../services/timeline/calendarFormat.js";
import { createTimelineOptions } from "./timelineOptions.js";
import { useVisTimeline } from "./useVisTimeline.js";
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
  eras: Era[];
  periods: Period[];
  calendarConfig: CalendarConfig;
  onSaveCard: (card: WorldCard) => Promise<void>;
  onSaveEra: (era: Era) => Promise<void>;
  onSavePeriod: (period: Period) => Promise<void>;
};

type ItemMeta = {
  itemKind: TimelineItemKind;
  sourceId: string;
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
  eras,
  periods,
  calendarConfig,
  onSaveCard,
  onSaveEra,
  onSavePeriod,
}: TimelineWorkspaceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const itemMetaRef = useRef<Map<string, ItemMeta>>(new Map());
  const cardsByIdRef = useRef(cardsById);
  const erasRef = useRef(eras);
  const periodsRef = useRef(periods);
  const calendarSuffixRef = useRef(calendarConfig.suffix);

  cardsByIdRef.current = cardsById;
  erasRef.current = eras;
  periodsRef.current = periods;
  calendarSuffixRef.current = calendarConfig.suffix;

  const timelineData = useMemo(
    () => buildTimelineItems({ cardsById, eras, periods }),
    [cardsById, eras, periods],
  );

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

      if (meta.itemKind === "era") {
        const era = erasRef.current.find((entry) => entry.id === meta.sourceId);
        if (!era || endYear === undefined) {
          return;
        }
        await onSaveEra({
          ...era,
          start_year: startYear,
          end_year: endYear,
        });
        return;
      }

      if (meta.itemKind === "period") {
        const period = periodsRef.current.find((entry) => entry.id === meta.sourceId);
        if (!period || endYear === undefined) {
          return;
        }
        await onSavePeriod({
          ...period,
          start_year: startYear,
          end_year: endYear,
        });
      }
    },
    [onSaveCard, onSaveEra, onSavePeriod],
  );

  const debouncedPersistRef = useRef(
    debounce((itemId: string, start: Date, end?: Date) => {
      void persistItemMove(itemId, start, end);
    }, 350),
  );

  useEffect(() => {
    debouncedPersistRef.current = debounce((itemId: string, start: Date, end?: Date) => {
      void persistItemMove(itemId, start, end);
    }, 350);
  }, [persistItemMove]);

  const handleMoving = useCallback<TimelineOptionsItemCallbackFunction>((item, callback) => {
    const startYear = dateToYear(item.start);
    item.start = yearToDate(startYear);
    if (item.end !== undefined && item.end !== null) {
      item.end = yearToDate(dateToYear(item.end));
    }
    callback(item);
  }, []);

  const handleMove = useCallback<TimelineOptionsItemCallbackFunction>((item, callback) => {
    callback(item);
    const start = coerceTimelineDate(item.start);
    const end =
      item.end !== undefined && item.end !== null
        ? coerceTimelineDate(item.end)
        : undefined;
    debouncedPersistRef.current(String(item.id), start, end);
  }, []);

  const windowRangeRef = useRef(windowRange);
  windowRangeRef.current = windowRange;

  const createOptions = useCallback(
    (height: number) =>
      createTimelineOptions({
        suffix: calendarSuffixRef.current,
        min: windowRangeRef.current.min,
        max: windowRangeRef.current.max,
        height,
        onMoving: handleMoving,
        onMove: handleMove,
      }),
    [handleMove, handleMoving],
  );

  const { timelineRef, itemsRef, groupsRef, initError, isReady, hostHeight } =
    useVisTimeline({
      isOpen,
      mountRef,
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
      meta.set(item.id, { itemKind: item.itemKind, sourceId: item.sourceId });
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
      height: hostHeight > 0 ? hostHeight : undefined,
      format: {
        minorLabels: (date: unknown) =>
          formatYear(dateToYear(date), calendarConfig.suffix),
        majorLabels: (date: unknown) =>
          formatYear(dateToYear(date), calendarConfig.suffix),
      },
    });
    timeline.redraw();
  }, [
    calendarConfig.suffix,
    hostHeight,
    isReady,
    itemsRef,
    groupsRef,
    timelineData,
    timelineRef,
    windowRange.max,
    windowRange.min,
  ]);

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
      <div aria-hidden className={pageBackdropClassName} />
      <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-wn-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <h1 id="timeline-workspace-title" {...getHeadingProps("h2", { tone: "inverse" })}>
            Timeline
          </h1>
          <p style={getBodyTextStyle("small")} className="text-wn-text-muted">
            {worldName}
          </p>
        </div>
        <CloseIconButton aria-label="Close timeline" onPress={onClose} />
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col p-3">
        <div className="wn-timeline-root relative min-h-0 flex-1 overflow-hidden rounded-lg border border-wn-border bg-wn-surface/40">
          <div className="absolute inset-0 min-h-80">
            <div ref={mountRef} className="wn-timeline-mount h-full w-full" />
          </div>

          {initError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-wn-bg/80 p-6">
              <p style={getBodyTextStyle("small")} className="text-wn-text-muted">
                {initError}
              </p>
            </div>
          ) : null}

          {!initError && isReady && timelineData.items.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
              <p
                style={getBodyTextStyle("small")}
                className="max-w-md text-center text-wn-text-muted"
              >
                Add birth/start years on character or event cards to populate the timeline.
                Legacy birthdate strings with a number (e.g. 10191 AG) also work.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </AnimatedModal>
  );
}
