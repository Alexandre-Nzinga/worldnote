export type MaterialIconPickerOption = {
  value: string;
  label: string;
};

function labelFromIconName(name: string): string {
  return name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const CURATED_ICON_NAMES = [
  "auto_awesome",
  "swords",
  "forum",
  "child_care",
  "explore",
  "person",
  "groups",
  "family_restroom",
  "favorite",
  "handshake",
  "psychology",
  "menu_book",
  "auto_stories",
  "edit_note",
  "chat",
  "record_voice_over",
  "lightbulb",
  "map",
  "location_on",
  "location_city",
  "home",
  "park",
  "travel_explore",
  "hiking",
  "pets",
  "science",
  "healing",
  "local_fire_department",
  "water_drop",
  "wb_sunny",
  "nightlight",
  "shield",
  "sports_martial_arts",
  "gavel",
  "balance",
  "skull",
  "timeline",
  "hub",
  "category",
  "search",
  "refresh",
  "add_circle",
  "layers",
  "auto_fix_high",
  "bolt",
  "star",
  "celebration",
  "military_tech",
  "workspace_premium",
  "visibility",
  "lock",
  "key",
] as const;

export const MATERIAL_ICON_PICKER_OPTIONS: MaterialIconPickerOption[] =
  CURATED_ICON_NAMES.map((value) => ({
    value,
    label: labelFromIconName(value),
  }));

export function resolveMaterialIconPickerOptions(
  value: string,
): MaterialIconPickerOption[] {
  const trimmed = value.trim();
  if (!trimmed) {
    return MATERIAL_ICON_PICKER_OPTIONS;
  }
  const exists = MATERIAL_ICON_PICKER_OPTIONS.some(
    (option) => option.value === trimmed,
  );
  if (exists) {
    return MATERIAL_ICON_PICKER_OPTIONS;
  }
  return [
    { value: trimmed, label: labelFromIconName(trimmed) },
    ...MATERIAL_ICON_PICKER_OPTIONS,
  ];
}
