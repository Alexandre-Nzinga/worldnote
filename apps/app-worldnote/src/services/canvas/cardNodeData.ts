import { convertFileSrc } from "@tauri-apps/api/core";

import type { CardNodeData, CardNodeScalars } from "@worldnote/canvas";

import {
  CARD_TYPE_LABELS,
  listSocketsForCardType,
  normalizeCardImageDisplay,
  type Link,
  type WorldCard,
} from "@worldnote/shared";

import { getSocketLinkLabels } from "../links/socketLinks.js";
import type { VisibleSocketsByCardType } from "../settings/settings.js";
import { getVisibleSocketsForCardType } from "../settings/visibleSocketSettings.js";

export function cardImageSrc(
  vaultPath: string,
  imagePath?: string,
): string | undefined {
  if (!imagePath?.trim()) {
    return undefined;
  }
  const normalized = imagePath.replace(/\\/g, "/");
  const fullPath = `${vaultPath.replace(/\\/g, "/")}/${normalized}`;
  return convertFileSrc(fullPath);
}

function scalarsFromCard(card: WorldCard): CardNodeScalars {
  switch (card.card_type) {
    case "character":
      return {
        gender: card.gender,
        birthdate: card.birthdate,
        deathdate: card.deathdate,
        race: card.race,
        appearance: card.appearance,
        personality: card.personality,
      };
    case "location":
      return { coordinates: card.coordinates };
    default:
      return {};
  }
}

function subtitleForCard(card: WorldCard): string {
  const typeLabel = CARD_TYPE_LABELS[card.card_type];

  switch (card.card_type) {
    case "character":
      return (
        card.birthdate?.trim() || card.description?.trim() || typeLabel
      );
    case "location":
      return (
        card.coordinates?.trim() || card.description?.trim() || typeLabel
      );
    case "item":
      return card.rarity
        ? `${card.rarity.charAt(0).toUpperCase()}${card.rarity.slice(1)}`
        : typeLabel;
    case "vehicle":
      return card.max_speed?.trim() || card.sub_type || typeLabel;
    case "flora":
      return card.toxicity_level || typeLabel;
    case "fauna":
      return card.diet
        ? `${card.diet.charAt(0).toUpperCase()}${card.diet.slice(1)}`
        : typeLabel;
    case "structure":
      return card.condition || typeLabel;
    case "species":
      return card.average_lifespan?.trim() || typeLabel;
    case "building":
      return card.description?.trim() || typeLabel;
    default:
      return typeLabel;
  }
}

export type WorldCardToNodeDataOptions = {
  visibleSocketsSettings?: VisibleSocketsByCardType;
  links?: Link[];
  cardsById?: Record<string, WorldCard>;
  onUpdate?: (partial: Record<string, unknown>) => void;
};

export function worldCardToNodeData(
  card: WorldCard,
  vaultPath: string,
  options: WorldCardToNodeDataOptions = {},
): CardNodeData {
  const {
    visibleSocketsSettings,
    links = [],
    cardsById = {},
    onUpdate,
  } = options;

  const imageDisplay = normalizeCardImageDisplay(
    card.image_fit,
    card.image_position,
  );

  const socketEntries = listSocketsForCardType(card.card_type);
  const socketLinkLabels = getSocketLinkLabels(
    card.id,
    links,
    (cardId) => cardsById[cardId]?.name,
  );

  const viewModeRaw = card.custom_properties?.view_mode;
  const viewMode =
    viewModeRaw === "visual" || viewModeRaw === "node" ? viewModeRaw : undefined;

  return {
    cardId: card.id,
    title: card.name,
    subtitle: subtitleForCard(card),
    cardType: card.card_type,
    description: card.description,
    imageUrl: cardImageSrc(vaultPath, card.image_path),
    imageFit: imageDisplay.fit,
    imagePosition: imageDisplay.position,
    sockets: socketEntries.map(({ id, descriptor }) => ({
      id,
      accepts: descriptor.accepts,
      cardinality: descriptor.cardinality,
    })),
    visibleSockets: getVisibleSocketsForCardType(
      visibleSocketsSettings,
      card.card_type,
    ),
    scalars: scalarsFromCard(card),
    socketValues: socketLinkLabels,
    viewMode,
    customProperties: card.custom_properties,
    onUpdate,
  };
}
