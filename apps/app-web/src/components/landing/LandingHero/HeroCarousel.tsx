import { HeroCarouselImage } from "./HeroCarouselImage";
import {
  heroCarouselRowOne,
  heroCarouselRowTwo,
  type HeroCarouselImageItem,
} from "./heroCarouselContent";

function CarouselRow({
  items,
  direction,
}: {
  items: HeroCarouselImageItem[];
  direction: "left" | "right";
}) {
  const loopedItems = [...items, ...items];
  const animationClass =
    direction === "left" ? "hero-carousel-left" : "hero-carousel-right";

  return (
    <div className="relative flex overflow-hidden">
      <div
        className={`flex min-w-max items-center gap-4 py-2 ${animationClass}`}
        aria-hidden
      >
        {loopedItems.map((item, index) => (
          <HeroCarouselImage key={`${item.id}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export function HeroCarousel() {
  return (
    <div className="relative w-full overflow-hidden py-4" aria-hidden>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-wn-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-wn-bg to-transparent" />

      <div className="flex flex-col gap-3">
        <CarouselRow items={heroCarouselRowOne} direction="left" />
        <CarouselRow items={heroCarouselRowTwo} direction="right" />
      </div>
    </div>
  );
}
