export type UnitSystem = "metric" | "imperial";

export type MeasurementKind =
  | "weight"
  | "height"
  | "temperature"
  | "distance"
  | "speed";

const LB_PER_KG = 2.204_622_621_8;
const CM_PER_INCH = 2.54;
const M_PER_FT = 0.3048;
const FT_PER_MILE = 5280;
const M_PER_KM = 1000;
const KMH_PER_MPH = 1.609_344;

/** Guidance for LLM measurement fields (schema + prompts). */
export const MEASUREMENT_GENERATION_HINT =
  "Positive number in canonical metric units only. No text, units, ranges, or qualifiers.";

/** Card schema fields that store measurements as numeric strings. */
const MEASUREMENT_STRING_FIELD_KEYS = new Set(["max_speed"]);

export function storesMeasurementAsString(fieldKey: string): boolean {
  return MEASUREMENT_STRING_FIELD_KEYS.has(fieldKey);
}

/** Canonical storage units: kg, cm, °C, m, km/h. */
export const CANONICAL_UNITS: Record<MeasurementKind, string> = {
  weight: "kg",
  height: "cm",
  temperature: "°C",
  distance: "m",
  speed: "km/h",
};

const MEASUREMENT_KEY_ALIASES: Record<string, MeasurementKind> = {
  weight: "weight",
  mass: "weight",
  height: "height",
  stature: "height",
  temperature: "temperature",
  temp: "temperature",
  distance: "distance",
  range: "distance",
  radius: "distance",
  length: "distance",
  depth: "distance",
  span: "distance",
  altitude: "distance",
  elevation: "distance",
  speed: "speed",
  velocity: "speed",
  maxspeed: "speed",
};

const FIELD_BASE_LABELS: Record<MeasurementKind, string> = {
  weight: "Weight",
  height: "Height",
  temperature: "Temperature",
  distance: "Distance",
  speed: "Speed",
};

function normalizePropertyKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");
}

function includesToken(normalized: string, token: string): boolean {
  return normalized.includes(token);
}

/** Detects measurement fields from a property or field key. */
export function detectMeasurementKind(key: string): MeasurementKind | null {
  const normalized = normalizePropertyKey(key);
  const direct = MEASUREMENT_KEY_ALIASES[normalized];
  if (direct) {
    return direct;
  }
  if (
    includesToken(normalized, "weight") ||
    includesToken(normalized, "mass")
  ) {
    return "weight";
  }
  if (
    includesToken(normalized, "height") ||
    includesToken(normalized, "stature")
  ) {
    return "height";
  }
  if (
    includesToken(normalized, "temperature") ||
    (includesToken(normalized, "temp") && !includesToken(normalized, "attempt"))
  ) {
    return "temperature";
  }
  if (
    includesToken(normalized, "distance") ||
    includesToken(normalized, "range") ||
    includesToken(normalized, "radius") ||
    includesToken(normalized, "length") ||
    includesToken(normalized, "depth") ||
    includesToken(normalized, "span") ||
    includesToken(normalized, "altitude") ||
    includesToken(normalized, "elevation")
  ) {
    return "distance";
  }
  if (
    includesToken(normalized, "speed") ||
    includesToken(normalized, "velocity")
  ) {
    return "speed";
  }
  return null;
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatNumber(value: number, decimals: number): string {
  const rounded = roundTo(value, decimals);
  return rounded.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });
}

function tryParseCanonicalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Coerces wizard output into a non-negative canonical measurement.
 * Rejects negative values; salvages the first positive number from prose.
 */
export function normalizeCanonicalMeasurement(
  value: unknown,
): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value >= 0 ? value : undefined;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const direct = tryParseCanonicalNumber(trimmed);
    if (direct !== undefined) {
      return direct >= 0 ? direct : undefined;
    }
    const match = trimmed.match(/(\d+(?:\.\d+)?)/);
    if (!match) {
      return undefined;
    }
    const salvaged = Number(match[1]);
    return Number.isFinite(salvaged) && salvaged >= 0 ? salvaged : undefined;
  }
  return undefined;
}

export function toDisplayValue(
  canonical: number,
  kind: MeasurementKind,
  system: UnitSystem,
): number {
  if (system === "metric") {
    return canonical;
  }
  switch (kind) {
    case "weight":
      return canonical * LB_PER_KG;
    case "height":
      return canonical / CM_PER_INCH;
    case "temperature":
      return (canonical * 9) / 5 + 32;
    case "distance":
      return canonical / M_PER_FT;
    case "speed":
      return canonical / KMH_PER_MPH;
  }
}

export function toCanonicalValue(
  display: number,
  kind: MeasurementKind,
  system: UnitSystem,
): number {
  if (system === "metric") {
    return display;
  }
  switch (kind) {
    case "weight":
      return display / LB_PER_KG;
    case "height":
      return display * CM_PER_INCH;
    case "temperature":
      return ((display - 32) * 5) / 9;
    case "distance":
      return display * M_PER_FT;
    case "speed":
      return display * KMH_PER_MPH;
  }
}

function formatWeightMetric(kg: number): string {
  if (kg > 0 && kg < 1) {
    return `${formatNumber(kg * 1000, 0)} g`;
  }
  return `${formatNumber(kg, kg < 10 ? 2 : 1)} kg`;
}

function formatWeightImperial(kg: number): string {
  const lb = kg * LB_PER_KG;
  if (lb > 0 && lb < 1) {
    return `${formatNumber(lb * 16, 1)} oz`;
  }
  return `${formatNumber(lb, lb < 10 ? 2 : 1)} lb`;
}

function formatHeightMetric(cm: number): string {
  return `${formatNumber(cm, cm < 10 ? 1 : 0)} cm`;
}

function formatHeightImperial(cm: number): string {
  const totalInches = cm / CM_PER_INCH;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  if (feet <= 0) {
    return `${inches} in`;
  }
  return `${feet}' ${inches}"`;
}

function formatTemperatureMetric(celsius: number): string {
  return `${formatNumber(celsius, 1)} °C`;
}

function formatTemperatureImperial(celsius: number): string {
  const fahrenheit = (celsius * 9) / 5 + 32;
  return `${formatNumber(fahrenheit, 1)} °F`;
}

function formatDistanceMetric(meters: number): string {
  if (meters >= M_PER_KM) {
    return `${formatNumber(meters / M_PER_KM, meters >= 10_000 ? 0 : 1)} km`;
  }
  return `${formatNumber(meters, meters < 10 ? 1 : 0)} m`;
}

function formatDistanceImperial(meters: number): string {
  const feet = meters / M_PER_FT;
  if (feet >= FT_PER_MILE) {
    return `${formatNumber(feet / FT_PER_MILE, feet >= FT_PER_MILE * 10 ? 0 : 1)} mi`;
  }
  return `${formatNumber(feet, feet < 10 ? 1 : 0)} ft`;
}

function formatSpeedMetric(kmh: number): string {
  return `${formatNumber(kmh, kmh < 10 ? 1 : 0)} km/h`;
}

function formatSpeedImperial(kmh: number): string {
  return `${formatNumber(kmh / KMH_PER_MPH, 0)} mph`;
}

/** Formats a canonical stored value for display in the chosen unit system. */
export function formatMeasurementValue(
  canonical: number,
  kind: MeasurementKind,
  system: UnitSystem,
): string {
  if (!Number.isFinite(canonical)) {
    return "";
  }
  if (system === "metric") {
    switch (kind) {
      case "weight":
        return formatWeightMetric(canonical);
      case "height":
        return formatHeightMetric(canonical);
      case "temperature":
        return formatTemperatureMetric(canonical);
      case "distance":
        return formatDistanceMetric(canonical);
      case "speed":
        return formatSpeedMetric(canonical);
    }
  }
  switch (kind) {
    case "weight":
      return formatWeightImperial(canonical);
    case "height":
      return formatHeightImperial(canonical);
    case "temperature":
      return formatTemperatureImperial(canonical);
    case "distance":
      return formatDistanceImperial(canonical);
    case "speed":
      return formatSpeedImperial(canonical);
  }
}

/** Formats numeric strings; non-numeric values pass through unchanged. */
export function formatMeasurementStringValue(
  value: string,
  kind: MeasurementKind,
  system: UnitSystem,
): string {
  const parsed = tryParseCanonicalNumber(value);
  if (parsed === undefined) {
    return value;
  }
  return formatMeasurementValue(parsed, kind, system);
}

/** Parses user input in display units back to canonical storage. */
export function parseMeasurementInput(
  input: string,
  kind: MeasurementKind,
  system: UnitSystem,
): number | undefined {
  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return toCanonicalValue(parsed, kind, system);
}

/** Formats a string property value when the key is a known measurement field. */
export function formatMeasurementPropertyValue(
  key: string,
  value: string,
  system: UnitSystem,
): string {
  const kind = detectMeasurementKind(key);
  if (!kind) {
    return value;
  }
  return formatMeasurementStringValue(value, kind, system);
}

/** Converts edited display text to canonical storage for a measurement property. */
export function canonicalMeasurementPropertyValue(
  key: string,
  displayValue: string,
  system: UnitSystem,
): string {
  const kind = detectMeasurementKind(key);
  if (!kind) {
    return displayValue;
  }
  const canonical = parseMeasurementInput(displayValue, kind, system);
  if (canonical === undefined) {
    return displayValue;
  }
  return String(canonical);
}

function displayUnitSuffix(kind: MeasurementKind, system: UnitSystem): string {
  if (system === "metric") {
    switch (kind) {
      case "weight":
        return "kg";
      case "height":
        return "cm";
      case "temperature":
        return "°C";
      case "distance":
        return "m";
      case "speed":
        return "km/h";
    }
  }
  switch (kind) {
    case "weight":
      return "lb";
    case "height":
      return "ft/in";
    case "temperature":
      return "°F";
    case "distance":
      return "ft";
    case "speed":
      return "mph";
  }
}

export function measurementFieldLabel(
  kind: MeasurementKind,
  system: UnitSystem,
  baseLabel?: string,
): string {
  const base = baseLabel ?? FIELD_BASE_LABELS[kind];
  return `${base} (${displayUnitSuffix(kind, system)})`;
}

export function measurementInputPlaceholder(
  kind: MeasurementKind,
  system: UnitSystem,
): string {
  if (system === "metric") {
    switch (kind) {
      case "weight":
        return "e.g. 0.5";
      case "height":
        return "e.g. 180";
      case "temperature":
        return "e.g. 21";
      case "distance":
        return "e.g. 1500";
      case "speed":
        return "e.g. 120";
    }
  }
  switch (kind) {
    case "weight":
      return "e.g. 1.1";
    case "height":
      return "e.g. 71";
    case "temperature":
      return "e.g. 70";
    case "distance":
      return "e.g. 5000";
    case "speed":
      return "e.g. 75";
  }
}

/** Editor value for numeric measurement strings; non-numeric text is unchanged. */
export function measurementEditorValue(
  value: string,
  kind: MeasurementKind,
  system: UnitSystem,
): string {
  const canonical = tryParseCanonicalNumber(value);
  if (canonical === undefined) {
    return value;
  }
  return String(toDisplayValue(canonical, kind, system));
}

/** Stores user input as a canonical numeric string when parseable. */
export function measurementStoredValue(
  displayValue: string,
  kind: MeasurementKind,
  system: UnitSystem,
): string {
  const canonical = parseMeasurementInput(displayValue, kind, system);
  if (canonical === undefined) {
    return displayValue;
  }
  return String(canonical);
}
