import type { WorldCard } from "@worldnote/shared";
import { createCardTemplate, type NewCardType } from "./cardTemplates.js";

/**
 * Re-types a card: starts from the new type's defaults, then re-applies shared
 * base fields. Type-specific fields on the old card (e.g. character start_year)
 * are not copied and will be gone after save. Shared base fields kept: name,
 * subtitle, description, lore, tags, image, parent_id, position,
 * custom_properties. Lore is stored as markdown in `lore`.
 */
export function changeWorldCardType(
  card: WorldCard,
  newType: NewCardType,
): WorldCard {
  if (card.card_type === newType) {
    return card;
  }

  const template = createCardTemplate(newType, card.position, card.name);

  return {
    ...template,
    id: card.id,
    name: card.name,
    parent_id: card.parent_id,
    position: card.position,
    tags: card.tags,
    description: card.description,
    subtitle: card.subtitle,
    lore: card.lore,
    image_path: card.image_path,
    image_fit: card.image_fit,
    image_position: card.image_position,
    custom_properties: card.custom_properties ?? {},
  };
}
