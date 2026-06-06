import { invoke } from "@tauri-apps/api/core";
import { CalendarConfigSchema, EraSchema, PeriodSchema } from "@worldnote/shared";
import type { CalendarConfig, Era, Period } from "@worldnote/shared";

export async function listEras(vault: string): Promise<Era[]> {
  const raw = await invoke<unknown[]>("list_eras", { vault });
  return raw.flatMap((entry) => {
    const parsed = EraSchema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
}

export async function upsertEra(vault: string, era: Era): Promise<Era> {
  const validated = EraSchema.parse(era);
  await invoke<void>("upsert_era", { vault, era: validated });
  return validated;
}

export async function deleteEra(vault: string, id: string): Promise<void> {
  await invoke<void>("delete_era", { vault, id });
}

export async function listPeriods(vault: string): Promise<Period[]> {
  const raw = await invoke<unknown[]>("list_periods", { vault });
  return raw.flatMap((entry) => {
    const parsed = PeriodSchema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
}

export async function upsertPeriod(vault: string, period: Period): Promise<Period> {
  const validated = PeriodSchema.parse(period);
  await invoke<void>("upsert_period", { vault, period: validated });
  return validated;
}

export async function deletePeriod(vault: string, id: string): Promise<void> {
  await invoke<void>("delete_period", { vault, id });
}

export async function loadCalendarConfig(vault: string): Promise<CalendarConfig> {
  const raw = await invoke<unknown>("load_calendar_config", { vault });
  const parsed = CalendarConfigSchema.safeParse(raw);
  return parsed.success ? parsed.data : { suffix: "" };
}

export async function saveCalendarConfig(
  vault: string,
  config: CalendarConfig,
): Promise<CalendarConfig> {
  const validated = CalendarConfigSchema.parse(config);
  await invoke<void>("save_calendar_config", { vault, config: validated });
  return validated;
}
