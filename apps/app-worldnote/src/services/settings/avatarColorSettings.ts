export type AvatarColorToken =
  | "sunset"
  | "ocean"
  | "forest"
  | "berry"
  | "gold"
  | "mono";

type AvatarColorOption = {
  value: AvatarColorToken;
  label: string;
  gradient: string;
};

/** Gradient presets for profile avatars (WorldNote palette). */
export const AVATAR_COLOR_OPTIONS: readonly AvatarColorOption[] = [
  {
    value: "sunset",
    label: "Sunset",
    gradient: "!bg-gradient-to-br !from-wn-rose-500 !to-wn-amber-500",
  },
  {
    value: "ocean",
    label: "Ocean",
    gradient: "!bg-gradient-to-br !from-wn-azure-400 !to-wn-indigo-500",
  },
  {
    value: "forest",
    label: "Forest",
    gradient: "!bg-gradient-to-br !from-wn-lime-400 !to-wn-azure-500",
  },
  {
    value: "berry",
    label: "Berry",
    gradient: "!bg-gradient-to-br !from-wn-rose-400 !to-wn-indigo-500",
  },
  {
    value: "gold",
    label: "Gold",
    gradient: "!bg-gradient-to-br !from-wn-amber-400 !to-wn-rose-400",
  },
  {
    value: "mono",
    label: "Mono",
    gradient: "!bg-gradient-to-br !from-wn-mono-400 !to-wn-mono-600",
  },
] as const;

export const DEFAULT_AVATAR_COLOR: AvatarColorToken = "mono";

/** Literal utilities for Tailwind to emit avatar gradient classes. */
export const AVATAR_COLOR_RUNTIME_CLASSES =
  "!bg-gradient-to-br !from-wn-rose-500 !to-wn-amber-500 !from-wn-azure-400 !to-wn-indigo-500 !from-wn-lime-400 !to-wn-azure-500 !from-wn-rose-400 !to-wn-indigo-500 !from-wn-amber-400 !to-wn-rose-400 !from-wn-mono-400 !to-wn-mono-600 bg-gradient-to-br from-wn-rose-500 to-wn-amber-500 from-wn-azure-400 to-wn-indigo-500 from-wn-lime-400 to-wn-azure-500 from-wn-rose-400 to-wn-indigo-500 from-wn-amber-400 to-wn-rose-400 from-wn-mono-400 to-wn-mono-600";

const AVATAR_COLOR_VALUES = new Set(
  AVATAR_COLOR_OPTIONS.map((option) => option.value),
);

const GRADIENT_BY_TOKEN = new Map(
  AVATAR_COLOR_OPTIONS.map((option) => [option.value, option.gradient]),
);

const DEFAULT_AVATAR_GRADIENT =
  AVATAR_COLOR_OPTIONS.find((option) => option.value === DEFAULT_AVATAR_COLOR)
    ?.gradient ?? AVATAR_COLOR_OPTIONS[0].gradient;

export function normalizeAvatarColor(
  raw: string | undefined,
): AvatarColorToken {
  if (raw && AVATAR_COLOR_VALUES.has(raw as AvatarColorToken)) {
    return raw as AvatarColorToken;
  }
  return DEFAULT_AVATAR_COLOR;
}

export function avatarColorFallbackClassName(value: AvatarColorToken): string {
  return GRADIENT_BY_TOKEN.get(value) ?? DEFAULT_AVATAR_GRADIENT;
}

export function avatarColorSwatchClassName(value: AvatarColorToken): string {
  return avatarColorFallbackClassName(value);
}

export function avatarColorOptionLabel(value: AvatarColorToken): string {
  return (
    AVATAR_COLOR_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}
