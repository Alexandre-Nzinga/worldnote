import { convertFileSrc } from "@tauri-apps/api/core";

import type { CardNodeData, CardNodeScalars, GroupMemberPreview } from "@worldnote/canvas";

import {
  CARD_TYPE_LABELS,
  listSocketsForCardType,
  normalizeCardImageDisplay,
  type Link,
  type WorldCard,
} from "@worldnote/shared";

import { cardsInGroup } from "./groupMemberCards.js";
import { makeCardDragStartHandler } from "./cardDragOut.js";
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

function cardDescriptionLine(card: WorldCard): string | undefined {
  const fromDescription = card.description?.trim();
  if (fromDescription) {
    return fromDescription;
  }
  const fromLore = card.lore?.trim();
  if (!fromLore) {
    return undefined;
  }
  return fromLore
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
}

function subtitleForCard(card: WorldCard): string {
  const typeLabel = CARD_TYPE_LABELS[card.card_type];
  const explicitSubtitle = card.subtitle?.trim();
  if (explicitSubtitle) {
    return explicitSubtitle;
  }
  const descriptionLine = cardDescriptionLine(card);

  switch (card.card_type) {
    case "character":
      return card.birthdate?.trim() || descriptionLine || typeLabel;
    case "location":
      return card.coordinates?.trim() || descriptionLine || typeLabel;
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
    case "planet":
      return card.planet_type?.trim() || typeLabel;
    case "organization":
      return card.founding_date?.trim() || typeLabel;
    case "polity":
      return card.government_type?.trim() || typeLabel;
    case "event":
      return card.event_date?.trim() || typeLabel;
    case "family":
      return card.motto?.trim() || typeLabel;
    case "group":
      return card.group_type?.trim() || typeLabel;
    case "star":
      return card.spectral_class?.trim() || typeLabel;
    case "moon":
      return card.orbital_period?.trim() || typeLabel;
    case "asteroid":
      return card.composition?.trim() || typeLabel;
    case "satellite":
      return card.orbit_type?.trim() || typeLabel;
    case "building":
      return descriptionLine || typeLabel;
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

  const groupMembers: GroupMemberPreview[] | undefined =
    card.card_type === "group"
      ? cardsInGroup(card.id, cardsById).map((member) => {
          const imageDisplay = normalizeCardImageDisplay(
            member.image_fit,
            member.image_position,
          );
          return {
            cardId: member.id,
            title: member.name,
            cardType: member.card_type,
            imageUrl: cardImageSrc(vaultPath, member.image_path),
            imageFit: imageDisplay.fit,
            imagePosition: imageDisplay.position,
          };
        })
      : undefined;

  return {
    cardId: card.id,
    title: card.name,
    subtitle: subtitleForCard(card),
    cardType: card.card_type,
    description: cardDescriptionLine(card),
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
    onDragCardStart: makeCardDragStartHandler(card.id, card.name),
    groupMembers:
      groupMembers && groupMembers.length > 0 ? groupMembers : undefined,
  };
}
