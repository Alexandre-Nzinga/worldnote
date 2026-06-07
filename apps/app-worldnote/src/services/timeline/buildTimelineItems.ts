import type { ChronologyEntry, WorldCard } from "@worldnote/shared";
import { formatTimelineDateLabel, yearToDate } from "./calendarFormat.js";
import { chronologyTimelineStyle } from "./chronologyPeriodColors.js";
import {
  buildChronologyTimelineGroups,
  chronologyGroupId,
  chronologyItemId,
} from "./timelineChronology.js";
import {
  resolveCharacterTimelineYears,
  resolveEventTimelineYears,
} from "./resolveCardTimelineYears.js";

export const TIMELINE_GROUP_CHARACTERS = "characters";
export const TIMELINE_GROUP_EVENTS = "events";

export type TimelineItemKind = "character" | "event" | "chronology";

export type TimelineItemPreview = {
  title: string;
  kindLabel: string;
  dateLabel: string;
  imageUrl?: string;
  cardType?: WorldCard["card_type"];
};

export type TimelineVisItem = {
  id: string;
  content: string;
  start: Date;
  end?: Date;
  type?: "range" | "point" | "box" | "background";
  group?: string;
  className?: string;
  style?: string;
  title?: string;
  preview: TimelineItemPreview;
  /** Internal metadata for drag persistence. */
  itemKind: TimelineItemKind;
  sourceId: string;
};

const TIMELINE_KIND_LABELS: Record<TimelineItemKind, string> = {
  character: "Character",
  event: "Event",
  chronology: "Period",
};

function itemPreview(
  title: string,
  itemKind: TimelineItemKind,
  startYear: number,
  endYear: number | undefined,
  suffix: string,
): TimelineItemPreview {
  return {
    title,
    kindLabel: TIMELINE_KIND_LABELS[itemKind],
    dateLabel: formatTimelineDateLabel(startYear, endYear, suffix, {
      bornLabel: itemKind === "character" && endYear === undefined,
    }),
  };
}

export type TimelineVisGroup = {
  id: string;
  content: string;
  nestedGroups?: string[];
};

export type TimelineData = {
  items: TimelineVisItem[];
  groups: TimelineVisGroup[];
};

type BuildTimelineItemsInput = {
  cardsById: Record<string, WorldCard>;
  chronology: ChronologyEntry[];
  suffix?: string;
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

function chronologyTimelineItem(
  entry: ChronologyEntry,
  suffix: string,
): TimelineVisItem {
  return {
    id: chronologyItemId(entry.id),
    content: entry.name,
    start: yearToDate(entry.start_year),
    end: yearToDate(entry.end_year),
    type: "range",
    group: chronologyGroupId(entry.id),
    className: "wn-chronology-bg",
    style: chronologyTimelineStyle(entry.color),
    title: entry.name,
    preview: itemPreview(
      entry.name,
      "chronology",
      entry.start_year,
      entry.end_year,
      suffix,
    ),
    itemKind: "chronology",
    sourceId: entry.id,
  };
}

export function buildTimelineItems({
  cardsById,
  chronology,
  suffix = "",
}: BuildTimelineItemsInput): TimelineData {
  const items: TimelineVisItem[] = [];
  const groups: TimelineVisGroup[] = [
    ...buildChronologyTimelineGroups(chronology),
    { id: TIMELINE_GROUP_CHARACTERS, content: "Characters" },
    { id: TIMELINE_GROUP_EVENTS, content: "World Events" },
  ];

  for (const entry of chronology) {
    items.push(chronologyTimelineItem(entry, suffix));
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
        preview: itemPreview(card.name, "character", startYear, endYear, suffix),
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
        preview: itemPreview(
          card.name,
          "event",
          startYear,
          hasRange ? endYear : undefined,
          suffix,
        ),
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
