import type { TimelineOptions } from "vis-timeline";
import { dateToYear, formatYear, yearToDate } from "../../../services/timeline/calendarFormat.js";

/** Matches vis-timeline's internal year duration for zoom and axis stepping. */
const VIS_TIMELINE_MS_PER_YEAR = 1000 * 60 * 60 * 24 * 30 * 12;

function timelineAxisLabel(
  date: unknown,
  scale: string,
  suffix: string,
): string {
  if (scale !== "year") {
    return "";
  }
  return formatYear(dateToYear(date), suffix);
}

type CreateTimelineOptionsInput = {
  suffix: string;
  min: Date;
  max: Date;
  width: number;
  height: number;
  onMoving: TimelineOptions["onMoving"];
  onMove: TimelineOptions["onMove"];
};

export function createTimelineAxisFormat(suffix: string): TimelineOptions["format"] {
  return {
    minorLabels: (date: unknown, scale: string) =>
      timelineAxisLabel(date, scale, suffix),
    majorLabels: () => "",
  };
}

export function createTimelineOptions({
  suffix,
  min,
  max,
  width,
  height,
  onMoving,
  onMove,
}: CreateTimelineOptionsInput): TimelineOptions {
  return {
    width: width > 0 ? width : "100%",
    height: height > 0 ? height : "100%",
    editable: {
      add: false,
      remove: false,
      updateGroup: false,
      updateTime: true,
      overrideItems: false,
    },
    zoomable: true,
    moveable: true,
    selectable: true,
    multiselect: false,
    stack: true,
    verticalScroll: true,
    orientation: "top",
    min,
    max,
    zoomMin: VIS_TIMELINE_MS_PER_YEAR,
    showCurrentTime: false,
    showTooltips: false,
    format: createTimelineAxisFormat(suffix),
    snap: (date: unknown) => yearToDate(dateToYear(date)),
    onMoving,
    onMove,
  };
}
