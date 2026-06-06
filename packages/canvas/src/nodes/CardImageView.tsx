import type { SyntheticEvent } from "react";
import {
  cardImageObjectStyles,
  type CardImageFit,
  type CardImagePosition,
} from "./card-image-display.js";
import { useLazyImageVisible } from "./useLazyImageVisible.js";

export type CardImageViewProps = {
  src: string;
  alt?: string;
  fit?: CardImageFit;
  position?: CardImagePosition;
  className?: string;
  /** Defer decoding until the image is near the viewport (default on canvas). */
  lazy?: boolean;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
};

const DEFAULT_FIT: CardImageFit = "fill";
const DEFAULT_POSITION: CardImagePosition = { x: 50, y: 50 };

export function CardImageView({
  src,
  alt = "",
  fit = DEFAULT_FIT,
  position = DEFAULT_POSITION,
  className = "h-full w-full",
  lazy = true,
  onLoad,
}: CardImageViewProps) {
  const imageStyle = cardImageObjectStyles(fit, position);
  const { ref, isVisible } = useLazyImageVisible<HTMLImageElement>(lazy);

  return (
    <img
      ref={ref}
      src={isVisible ? src : undefined}
      alt={alt}
      className={className}
      style={imageStyle}
      draggable={false}
      loading={lazy ? "lazy" : "eager"}
      decoding="async"
      onLoad={onLoad}
    />
  );
}
