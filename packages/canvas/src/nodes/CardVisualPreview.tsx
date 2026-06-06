import type { ReactNode } from "react";
import { CardBrandLogo } from "./CardBrandLogo.js";
import type { CardImageFit, CardImagePosition } from "./card-image-display.js";
import { CardImageView } from "./CardImageView.js";
import { CardTypePlaceholder } from "./CardTypePlaceholder.js";
import { CardTypePill } from "./CardTypePill.js";
import {
  CARD_CHROME_BORDER_WIDTH_PX,
  cardInnerRadiusStyle,
  cardOuterRadiusStyle,
} from "./card-chrome-radius.js";
import {
  visualConfigFor,
  type WorldNoteCardType,
} from "./card-visual-config.js";
import {
  cardSubtitleTextClassName,
  cardTitleTextClassName,
} from "./card-title-text.js";
import { useImageLuminance } from "./useImageLuminance.js";

const cardRadiusStyle = cardOuterRadiusStyle;

type CardImageBorderFrameProps = {
  imageUrl?: string;
  widthClass?: string;
  className?: string;
  children: ReactNode;
};

function CardImageBorderFrame({
  imageUrl,
  widthClass = "w-full",
  className = "",
  children,
}: CardImageBorderFrameProps) {
  const hasImageBorder = Boolean(imageUrl);

  return (
    <div
      className={`relative shadow-lg ${widthClass} ${className} ${
        hasImageBorder
          ? ""
          : "overflow-hidden rounded-wn-card border-[5px] border-wn-mono-600"
      }`}
      style={
        hasImageBorder
          ? { ...cardRadiusStyle, padding: CARD_CHROME_BORDER_WIDTH_PX }
          : cardRadiusStyle
      }
    >
      {hasImageBorder ? (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={cardRadiusStyle}
          aria-hidden
        >
          <img
            src={imageUrl}
            alt=""
            className="absolute left-1/2 top-1/2 h-[150%] w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover opacity-95 saturate-150 blur-2xl"
          />
        </div>
      ) : null}
      <div
        className="relative overflow-hidden bg-wn-mono-900"
        style={cardInnerRadiusStyle}
      >
        {children}
      </div>
    </div>
  );
}

export type CardVisualPreviewProps = {
  title: string;
  subtitle?: string;
  cardType: WorldNoteCardType | string;
  imageUrl?: string;
  imageFit?: CardImageFit;
  imagePosition?: CardImagePosition;
  /** When set, uses fixed canvas width; otherwise fills the gallery cell. */
  widthClass?: string;
  className?: string;
};

/** Static visual card preview (canvas visual view) for galleries and pickers. */
export function CardVisualPreview({
  title,
  subtitle,
  cardType,
  imageUrl,
  imageFit,
  imagePosition,
  widthClass,
  className = "",
}: CardVisualPreviewProps) {
  const config = visualConfigFor(cardType);
  const { isDark } = useImageLuminance(imageUrl);
  const titleColorClass = isDark === false ? "text-black" : "text-white"; // default to white on unknown
  const subtitleColorClass =
    isDark === false ? "text-black/70" : "text-white/80";

  return (
    <CardImageBorderFrame
      imageUrl={imageUrl}
      widthClass={widthClass ?? "w-full"}
      className={className}
    >
      <div
        className={`relative w-full overflow-hidden bg-wn-mono-800 ${config.aspectClass}`}
      >
        {imageUrl ? (
          <CardImageView
            src={imageUrl}
            fit={imageFit}
            position={imagePosition}
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <CardTypePlaceholder
            cardType={cardType}
            className="absolute inset-0 h-full w-full"
          />
        )}
        <CardBrandLogo />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div
              className={`${cardTitleTextClassName} ${titleColorClass} ${config.titleClassName ?? "text-lg font-semibold leading-tight"}`}
            >
              {title}
            </div>
            {subtitle ? (
              <div
                className={`${cardSubtitleTextClassName} text-xs ${subtitleColorClass}`}
              >
                {subtitle}
              </div>
            ) : null}
          </div>
          <CardTypePill
            className={config.badgeClassName}
            textClassName={config.badgeTextColor}
          >
            {config.label}
          </CardTypePill>
        </div>
      </div>
    </CardImageBorderFrame>
  );
}
