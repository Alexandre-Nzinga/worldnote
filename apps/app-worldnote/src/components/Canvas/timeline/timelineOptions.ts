import type { TimelineOptions } from "vis-timeline";
import { dateToYear, formatYear, yearToDate } from "../../../services/timeline/calendarFormat.js";

type CreateTimelineOptionsInput = {
  suffix: string;
  min: Date;
  max: Date;
  height?: number;
  onMoving: TimelineOptions["onMoving"];
  onMove: TimelineOptions["onMove"];
};

export function createTimelineOptions({
  suffix,
  min,
  max,
  height,
  onMoving,
  onMove,
}: CreateTimelineOptionsInput): TimelineOptions {
  return {
    width: "100%",
    height: height && height > 0 ? height : "100%",
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
    orientation: "top",
    min,
    max,
    timeAxis: { scale: "year", step: 1 },
    showCurrentTime: false,
    format: {
      minorLabels: (date: unknown) => formatYear(dateToYear(date), suffix),
      majorLabels: (date: unknown) => formatYear(dateToYear(date), suffix),
    },
    snap: (date: unknown) => yearToDate(dateToYear(date)),
    onMoving,
    onMove,
  };
}
