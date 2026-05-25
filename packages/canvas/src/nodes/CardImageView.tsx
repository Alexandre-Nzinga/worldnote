import {
  cardImageObjectStyles,
  type CardImageFit,
  type CardImagePosition,
} from "./card-image-display.js";

export type CardImageViewProps = {
  src: string;
  alt?: string;
  fit?: CardImageFit;
  position?: CardImagePosition;
  className?: string;
};

const DEFAULT_FIT: CardImageFit = "fill";
const DEFAULT_POSITION: CardImagePosition = { x: 50, y: 50 };

export function CardImageView({
  src,
  alt = "",
  fit = DEFAULT_FIT,
  position = DEFAULT_POSITION,
  className = "h-full w-full",
}: CardImageViewProps) {
  const { objectFit, objectPosition } = cardImageObjectStyles(fit, position);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ objectFit, objectPosition }}
      draggable={false}
    />
  );
}
