import {
  normalizeTimelineYear,
  type CharacterCard,
  type EventCard,
  type WorldCard,
} from "@worldnote/shared";
import { extractYearFromString } from "./calendarFormat.js";

type LegacyCharacterCard = CharacterCard & {
  birthdate?: string;
  deathdate?: string;
};

type LegacyEventCard = EventCard & {
  event_date?: string;
};

/** Resolve timeline years from start_year/end_year, falling back to legacy string fields. */
export function resolveCharacterTimelineYears(
  card: WorldCard,
): { startYear: number; endYear?: number } | null {
  if (card.card_type !== "character") {
    return null;
  }

  const character = card as LegacyCharacterCard;
  const startYear = normalizeTimelineYear(
    character.start_year ?? extractYearFromString(character.birthdate),
  );
  if (startYear === undefined) {
    return null;
  }

  const endYear = normalizeTimelineYear(
    character.end_year ?? extractYearFromString(character.deathdate),
  );
  return { startYear, endYear };
}

export function resolveEventTimelineYears(
  card: WorldCard,
): { startYear: number; endYear?: number } | null {
  if (card.card_type !== "event") {
    return null;
  }

  const event = card as LegacyEventCard;
  const startYear = normalizeTimelineYear(
    event.start_year ?? extractYearFromString(event.event_date),
  );
  if (startYear === undefined) {
    return null;
  }

  return {
    startYear,
    endYear: normalizeTimelineYear(event.end_year),
  };
}
