import { convertFileSrc } from "@tauri-apps/api/core";

import type { CardNodeData, CardNodeScalars } from "@worldnote/canvas";

import {

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

  if (card.card_type === "character") {

    return {

      gender: card.gender,

      birthdate: card.birthdate,

      deathdate: card.deathdate,

      race: card.race,

      appearance: card.appearance,

      personality: card.personality,

    };

  }

  return {

    coordinates: card.coordinates,

  };

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

  const typeLabel = card.card_type === "character" ? "Character" : "Location";

  const imageDisplay = normalizeCardImageDisplay(

    card.image_fit,

    card.image_position,

  );

  const subtitle =

    card.card_type === "location"

      ? card.coordinates?.trim() ||

        card.description?.trim() ||

        typeLabel

      : card.birthdate?.trim() ||

        card.description?.trim() ||

        typeLabel;

  const socketEntries = listSocketsForCardType(card.card_type);

  const socketLinkLabels = getSocketLinkLabels(

    card.id,

    links,

    (cardId) => cardsById[cardId]?.name,

  );



  return {

    cardId: card.id,

    title: card.name,

    subtitle,

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

    onUpdate,

  };

}

