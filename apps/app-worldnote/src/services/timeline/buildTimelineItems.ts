import type { Era, Period, WorldCard } from "@worldnote/shared";
import { yearToDate } from "./calendarFormat.js";
import {
  resolveCharacterTimelineYears,
  resolveEventTimelineYears,
} from "./resolveCardTimelineYears.js";

export const TIMELINE_GROUP_CHARACTERS = "characters";
export const TIMELINE_GROUP_EVENTS = "events";

export type TimelineItemKind = "character" | "event" | "era" | "period";

export type TimelineVisItem = {
  id: string;
  content: string;
  start: Date;
  end?: Date;
  type?: "range" | "point" | "box" | "background";
  group?: string;
  className?: string;
  title?: string;
  /** Internal metadata for drag persistence. */
  itemKind: TimelineItemKind;
  sourceId: string;
};

export type TimelineVisGroup = {
  id: string;
  content: string;
};

export type TimelineData = {
  items: TimelineVisItem[];
  groups: TimelineVisGroup[];
};

type BuildTimelineItemsInput = {
  cardsById: Record<string, WorldCard>;
  eras: Era[];
  periods: Period[];
};

function characterLabel(
  card: WorldCard & { card_type: "character" },
  startYear: number,
  endYear?: number,
): string {
  if (endYear !== undefined) {
    return `${card.name} (${startYear}–${endYear})`;
  }
  return `${card.name} is born`;
}

function backgroundItem(
  entry: Era | Period,
  kind: "era" | "period",
): TimelineVisItem {
  return {
    id: `${kind}-${entry.id}`,
    content: entry.name,
    start: yearToDate(entry.start_year),
    end: yearToDate(entry.end_year),
    type: "background",
    className: kind === "era" ? "wn-era-bg" : "wn-period-bg",
    title: entry.name,
    itemKind: kind,
    sourceId: entry.id,
  };
}

export function buildTimelineItems({
  cardsById,
  eras,
  periods,
}: BuildTimelineItemsInput): TimelineData {
  const items: TimelineVisItem[] = [];
  const groups: TimelineVisGroup[] = [
    { id: TIMELINE_GROUP_CHARACTERS, content: "Characters" },
    { id: TIMELINE_GROUP_EVENTS, content: "World Events" },
  ];

  for (const era of eras) {
    items.push(backgroundItem(era, "era"));
  }
  for (const period of periods) {
    items.push(backgroundItem(period, "period"));
  }

  for (const card of Object.values(cardsById)) {
    const characterYears = resolveCharacterTimelineYears(card);
    if (characterYears && card.card_type === "character") {
      const { startYear, endYear } = characterYears;
      items.push({
        id: `character-${card.id}`,
        content: characterLabel(card, startYear, endYear),
        start: yearToDate(startYear),
        end: endYear !== undefined ? yearToDate(endYear) : undefined,
        type: endYear !== undefined ? "range" : "point",
        group: TIMELINE_GROUP_CHARACTERS,
        className: "wn-timeline-character",
        title: card.name,
        itemKind: "character",
        sourceId: card.id,
      });
      continue;
    }

    const eventYears = resolveEventTimelineYears(card);
    if (eventYears) {
      const { startYear, endYear } = eventYears;
      const hasRange = endYear !== undefined && endYear !== startYear;
      items.push({
        id: `event-${card.id}`,
        content: card.name,
        start: yearToDate(startYear),
        end: hasRange ? yearToDate(endYear) : undefined,
        type: hasRange ? "range" : "point",
        group: TIMELINE_GROUP_EVENTS,
        className: "wn-timeline-event",
        title: card.name,
        itemKind: "event",
        sourceId: card.id,
      });
    }
  }

  return { items, groups };
}

/** Compute a sensible default window from timeline items. */
export function computeTimelineWindow(items: TimelineVisItem[]): {
  min: Date;
  max: Date;
} {
  if (items.length === 0) {
    return {
      min: yearToDate(-100),
      max: yearToDate(100),
    };
  }

  let minYear = Number.POSITIVE_INFINITY;
  let maxYear = Number.NEGATIVE_INFINITY;

  for (const item of items) {
    const startYear = item.start.getUTCFullYear();
    const endYear = item.end?.getUTCFullYear() ?? startYear;
    minYear = Math.min(minYear, startYear, endYear);
    maxYear = Math.max(maxYear, startYear, endYear);
  }

  const padding = Math.max(10, Math.round((maxYear - minYear) * 0.1));
  return {
    min: yearToDate(minYear - padding),
    max: yearToDate(maxYear + padding),
  };
}
