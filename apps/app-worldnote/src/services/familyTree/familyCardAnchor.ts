import type { FamilyCard, WorldCard } from "@worldnote/shared";

function isFamilyCard(card: WorldCard): card is FamilyCard {
  return card.card_type === "family";
}

export function findFamilyCardByAnchor(
  cardsById: Record<string, WorldCard>,
  anchorCharacterId: string,
): FamilyCard | null {
  for (const card of Object.values(cardsById)) {
    if (isFamilyCard(card) && card.anchor_character_id === anchorCharacterId) {
      return card;
    }
  }
  return null;
}

export function familyCardsWithAnchor(
  cardsById: Record<string, WorldCard>,
): FamilyCard[] {
  return Object.values(cardsById).filter(
    (card): card is FamilyCard =>
      isFamilyCard(card) && typeof card.anchor_character_id === "string",
  );
}

export function defaultFamilyCardName(anchorName: string): string {
  const trimmed = anchorName.trim();
  if (!trimmed) {
    return "Family";
  }
  return `${trimmed}'s Family`;
}
