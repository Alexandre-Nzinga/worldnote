import { CardVisualPreview } from "@worldnote/canvas";
import { normalizeCardImageDisplay } from "@worldnote/shared";
import { MotionPressable } from "@worldnote/ui";
import type { LibraryCard } from "../../services/library/listAllCards.js";
import { cardImageSrc } from "../../services/canvas/cardNodeData.js";

type VaultCardChipProps = {
  card: LibraryCard;
  draggable?: boolean;
};

export function VaultCardChip({ card, draggable = true }: VaultCardChipProps) {
  const imageDisplay = normalizeCardImageDisplay(card.imageFit, card.imagePosition);
  const imageUrl = cardImageSrc(card.worldPath, card.imagePath);

  return (
    <MotionPressable
      className="block w-full text-left"
      enableHover
      draggable={draggable}
      onDragStart={(event) => {
        if (!draggable) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.setData(
          "application/worldnote-card-ref",
          JSON.stringify({ sourceWorldPath: card.worldPath, cardId: card.cardId }),
        );
        event.dataTransfer.setData("text/plain", card.name);
        event.dataTransfer.effectAllowed = "copy";
      }}
    >
      <CardVisualPreview
        title={card.name}
        subtitle={card.subtitle}
        cardType={card.cardType}
        imageUrl={imageUrl}
        imageFit={imageDisplay.fit}
        imagePosition={imageDisplay.position}
      />
    </MotionPressable>
  );
}
