import type { CalendarConfig, ChronologyEntry } from "@worldnote/shared";
import { useMemo } from "react";
import {
  deleteChronology,
  listChronology,
  loadCalendarConfig,
  saveCalendarConfig,
  upsertChronology,
} from "../services/timeline/timelineCommands.js";

export function useTimelineCommands() {
  return useMemo(
    () => ({
      listChronology: (vault: string) => listChronology(vault),
      upsertChronology: (vault: string, entry: ChronologyEntry) =>
        upsertChronology(vault, entry),
      deleteChronology: (vault: string, id: string) => deleteChronology(vault, id),
      loadCalendarConfig: (vault: string) => loadCalendarConfig(vault),
      saveCalendarConfig: (vault: string, config: CalendarConfig) =>
        saveCalendarConfig(vault, config),
    }),
    [],
  );
}
