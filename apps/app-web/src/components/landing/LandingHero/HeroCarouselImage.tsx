import { MaterialSymbol } from "@worldnote/ui";
import type { HeroCarouselImageItem } from "./heroCarouselContent";

type HeroCarouselImageProps = {
  item: HeroCarouselImageItem;
};

export function HeroCarouselImage({ item }: HeroCarouselImageProps) {
  return (
    <div
      className="relative h-[108px] w-[108px] shrink-0 overflow-hidden rounded-3xl bg-wn-mono-900"
      aria-hidden
    >
      {item.src ? (
        <img
          src={item.src}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <MaterialSymbol
            name="image"
            className="text-3xl text-wn-mono-600"
          />
          <span
            className="px-2 text-center text-wn-mono-600"
            style={{
              fontSize: "10px",
              fontWeight: "var(--font-weight-wn-medium)",
            }}
          >
            Image
          </span>
        </div>
      )}
    </div>
  );
}
