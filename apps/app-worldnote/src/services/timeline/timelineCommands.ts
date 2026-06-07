import { invoke } from "@tauri-apps/api/core";
import { CalendarConfigSchema, ChronologyEntrySchema } from "@worldnote/shared";
import type { CalendarConfig, ChronologyEntry } from "@worldnote/shared";

function stripLegacyParentKind(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) {
    return raw;
  }
  return Object.fromEntries(
    Object.entries(raw).filter(([key]) => key !== "parent_kind"),
  );
}

function parseChronologyEntry(raw: unknown): ChronologyEntry | null {
  const parsed = ChronologyEntrySchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }
  const legacy = ChronologyEntrySchema.safeParse(stripLegacyParentKind(raw));
  return legacy.success ? legacy.data : null;
}

export async function listChronology(
  vault: string,
): Promise<ChronologyEntry[]> {
  const raw = await invoke<unknown[]>("list_chronology", { vault });
  return raw.flatMap((entry) => {
    const parsed = parseChronologyEntry(entry);
    return parsed ? [parsed] : [];
  });
}

export async function upsertChronology(
  vault: string,
  entry: ChronologyEntry,
): Promise<ChronologyEntry> {
  const validated = ChronologyEntrySchema.parse(entry);
  await invoke<void>("upsert_chronology", { vault, entry: validated });
  return validated;
}

export async function deleteChronology(
  vault: string,
  id: string,
): Promise<void> {
  await invoke<void>("delete_chronology", { vault, id });
}

export async function loadCalendarConfig(
  vault: string,
): Promise<CalendarConfig> {
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
