import type { CardImageFit, CardImagePosition } from "./card-image-display.js";
import type { WorldNoteCardType } from "./card-visual-config.js";

export type GroupMemberPreview = {
  cardId: string;
  title: string;
  cardType?: WorldNoteCardType | string;
  imageUrl?: string;
  imageFit?: CardImageFit;
  imagePosition?: CardImagePosition;
};
