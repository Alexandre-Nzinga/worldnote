import type { CharacterCard, EventCard, WorldCard } from "@worldnote/shared";
import { extractYearFromString } from "../timeline/calendarFormat.js";

type LegacyCharacterCard = CharacterCard & {
  birthdate?: string;
  deathdate?: string;
};

type LegacyEventCard = EventCard & {
  event_date?: string;
};

function isLegacyCharacterCard(card: WorldCard): card is LegacyCharacterCard {
  return (
    card.card_type === "character" &&
    ("birthdate" in card || "deathdate" in card)
  );
}

function isLegacyEventCard(card: WorldCard): card is LegacyEventCard {
  return card.card_type === "event" && "event_date" in card;
}

/** Migrate legacy string date fields to integer start_year/end_year. Idempotent. */
export function migrateCardChronology(card: WorldCard): {
  card: WorldCard;
  changed: boolean;
} {
  if (isLegacyCharacterCard(card)) {
    const { birthdate, deathdate, ...rest } = card;
    const start_year = rest.start_year ?? extractYearFromString(birthdate);
    const end_year = rest.end_year ?? extractYearFromString(deathdate);

    return {
      card: {
        ...rest,
        card_type: "character",
        start_year,
        end_year,
      },
      changed: true,
    };
  }

  if (isLegacyEventCard(card)) {
    const { event_date, ...rest } = card;
    const start_year = rest.start_year ?? extractYearFromString(event_date);

    return {
      card: {
        ...rest,
        card_type: "event",
        start_year,
      },
      changed: true,
    };
  }

  return { card, changed: false };
}

export function migrateCardsChronology(cards: WorldCard[]): {
  cards: WorldCard[];
  changedIds: string[];
} {
  const changedIds: string[] = [];
  const migrated = cards.map((card) => {
    const result = migrateCardChronology(card);
    if (result.changed) {
      changedIds.push(card.id);
    }
    return result.card;
  });
  return { cards: migrated, changedIds };
}
