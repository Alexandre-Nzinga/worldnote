import { convertFileSrc } from "@tauri-apps/api/core";

import type {
  CardNodeContextMenuPointer,
  CardNodeData,
  CardNodeScalars,
  CardNodeSelectModifiers,
  CardViewMode,
  GroupMemberPreview,
} from "@worldnote/canvas";

import { openCanvasCardContextMenuRef } from "./canvasCardContextMenuRef.js";
import { applyCanvasCardSelectionRef } from "./canvasCardSelectionRef.js";

import {
  listSocketsForCardType,
  normalizeCardImageDisplay,
  type Link,
  type WorldCard,
} from "@worldnote/shared";

import { cardsInGroup } from "./groupMemberCards.js";
import { makeCardDragStartHandler } from "./cardDragOut.js";
import { withCardPatch } from "../crudWorldCard/withCardPatch.js";
import { getSocketLinkLabels } from "../links/socketLinks.js";
import type {
  CardTypeBadgeOverrides,
  KinshipBadgeOverride,
  VisibleSocketsByCardType,
} from "../settings/settings.js";
import { resolveCardBadgeStyle } from "../settings/cardTypeBadgeSettings.js";
import { resolveKinshipBadgeStyle } from "../settings/kinshipBadgeSettings.js";
import { getVisibleSocketsForCardType } from "../settings/visibleSocketSettings.js";
import { formatYear } from "../timeline/calendarFormat.js";

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
        start_year: card.start_year,
        end_year: card.end_year,
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

function subtitleForCard(card: WorldCard): string | undefined {
  const explicitSubtitle = card.subtitle?.trim();
  if (explicitSubtitle) {
    return explicitSubtitle;
  }

  switch (card.card_type) {
    case "character":
      return card.start_year !== undefined
        ? formatYear(card.start_year)
        : undefined;
    case "location":
      return card.coordinates?.trim() || undefined;
    case "item":
      return card.rarity
        ? `${card.rarity.charAt(0).toUpperCase()}${card.rarity.slice(1)}`
        : undefined;
    case "vehicle":
      return card.max_speed?.trim() || card.sub_type || undefined;
    case "flora":
      return card.toxicity_level || undefined;
    case "fauna":
      return card.diet
        ? `${card.diet.charAt(0).toUpperCase()}${card.diet.slice(1)}`
        : undefined;
    case "structure":
      return card.condition || undefined;
    case "species":
      return card.average_lifespan?.trim();
    case "planet":
      return card.planet_type?.trim();
    case "organization":
      return card.founding_date?.trim();
    case "polity":
      return card.government_type?.trim();
    case "event":
      return card.start_year !== undefined
        ? formatYear(card.start_year)
        : undefined;
    case "family":
      return card.motto?.trim();
    case "group":
      return card.group_type?.trim();
    case "star":
      return card.spectral_class?.trim();
    case "moon":
      return card.orbital_period?.trim();
    case "asteroid":
      return card.composition?.trim();
    case "satellite":
      return card.orbit_type?.trim();
    default:
      return undefined;
  }
}

export type WorldCardToNodeDataOptions = {
  visibleSocketsSettings?: VisibleSocketsByCardType;
  cardTypeBadgeColors?: CardTypeBadgeOverrides;
  kinshipLabelColors?: KinshipBadgeOverride;
  links?: Link[];
  cardsById?: Record<string, WorldCard>;
  familyTree?: {
    kinshipLabel?: string;
    hidden?: boolean;
    dimmed?: boolean;
  };
  onUpdate?: (partial: Record<string, unknown>) => void;
  onViewModeChange?: (viewMode: CardViewMode) => void;
  onSelect?: (modifiers: CardNodeSelectModifiers) => void;
  onContextMenu?: (pointer: CardNodeContextMenuPointer) => void;
};

type SaveCardFn = (
  card: WorldCard,
  options?: { notify?: boolean },
) => Promise<void>;

/** Wires canvas card nodes to persist content edits vs silent view-mode toggles. */
export function cardNodeSaveCallbacks(
  card: WorldCard,
  saveCard: SaveCardFn,
): Pick<WorldCardToNodeDataOptions, "onUpdate" | "onViewModeChange"> {
  return {
    onViewModeChange: (viewMode) => {
      void saveCard(
        withCardPatch(card, {
          custom_properties: {
            ...(card.custom_properties ?? {}),
            view_mode: viewMode,
          },
        }),
        { notify: false },
      );
    },
    onUpdate: (partial) => {
      void saveCard(withCardPatch(card, partial));
    },
  };
}

export function cardNodeOnSelectHandler(
  cardId: string,
): (modifiers: CardNodeSelectModifiers) => void {
  return (modifiers) => {
    applyCanvasCardSelectionRef.current?.(cardId, modifiers);
  };
}

export function cardNodeOnContextMenuHandler(
  cardId: string,
): (pointer: { clientX: number; clientY: number }) => void {
  return (pointer) => {
    openCanvasCardContextMenuRef.current?.(cardId, pointer);
  };
}

export function worldCardToNodeData(
  card: WorldCard,
  vaultPath: string,
  options: WorldCardToNodeDataOptions = {},
): CardNodeData {
  const {
    visibleSocketsSettings,
    cardTypeBadgeColors,
    kinshipLabelColors,
    links = [],
    cardsById = {},
    familyTree,
    onUpdate,
    onViewModeChange,
    onSelect = cardNodeOnSelectHandler(card.id),
    onContextMenu = cardNodeOnContextMenuHandler(card.id),
  } = options;

  const badgeStyle = resolveCardBadgeStyle(card.card_type, cardTypeBadgeColors);
  const kinshipBadgeStyle = resolveKinshipBadgeStyle(kinshipLabelColors);

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
    viewModeRaw === "visual" || viewModeRaw === "node"
      ? viewModeRaw
      : undefined;

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

  const crestUrl =
    card.card_type === "family" && card.crest_path
      ? cardImageSrc(vaultPath, card.crest_path)
      : undefined;

  return {
    cardId: card.id,
    title: card.name,
    subtitle: subtitleForCard(card),
    cardType: card.card_type,
    badgeClassName: badgeStyle.badgeClassName,
    badgeTextColor: badgeStyle.badgeTextColor,
    imageUrl: cardImageSrc(vaultPath, card.image_path),
    crestUrl,
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
    onViewModeChange,
    onSelect,
    onContextMenu,
    onDragCardStart: makeCardDragStartHandler(card.id, card.name),
    kinshipLabel: familyTree?.kinshipLabel,
    kinshipBadgeClassName: kinshipBadgeStyle.badgeClassName,
    kinshipBadgeTextColor: kinshipBadgeStyle.badgeTextColor,
    dimmed: familyTree?.dimmed || undefined,
    groupMembers:
      groupMembers && groupMembers.length > 0 ? groupMembers : undefined,
  };
}
