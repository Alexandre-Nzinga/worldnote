import type { CalendarConfig, Era, Period } from "@worldnote/shared";
import { useMemo } from "react";
import {
  deleteEra,
  deletePeriod,
  listEras,
  listPeriods,
  loadCalendarConfig,
  saveCalendarConfig,
  upsertEra,
  upsertPeriod,
} from "../services/timeline/timelineCommands.js";

export function useTimelineCommands() {
  return useMemo(
    () => ({
      listEras: (vault: string) => listEras(vault),
      upsertEra: (vault: string, era: Era) => upsertEra(vault, era),
      deleteEra: (vault: string, id: string) => deleteEra(vault, id),
      listPeriods: (vault: string) => listPeriods(vault),
      upsertPeriod: (vault: string, period: Period) => upsertPeriod(vault, period),
      deletePeriod: (vault: string, id: string) => deletePeriod(vault, id),
      loadCalendarConfig: (vault: string) => loadCalendarConfig(vault),
      saveCalendarConfig: (vault: string, config: CalendarConfig) =>
        saveCalendarConfig(vault, config),
    }),
    [],
  );
}
