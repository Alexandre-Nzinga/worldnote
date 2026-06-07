"use client";

import { Button, MaterialSymbol, usePrefersReducedMotion } from "@worldnote/ui";
import clsx from "clsx";
import { motion, type PanInfo } from "framer-motion";
import { useCallback, useState } from "react";
import { landingCopy } from "@/components/landing/shared/copy";
import {
  Reveal,
  SectionHeader,
  SectionShell,
} from "@/components/landing/shared/Reveal";

/** Edge-to-edge screenshot slider with drag gestures and placeholder wireframes. */
export function ScreenshotCarousel() {
  const { carousel } = landingCopy;
  const slides = carousel.slides;
  const slideCount = slides.length;
  const [index, setIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  const goTo = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(slideCount - 1, next)));
    },
    [slideCount],
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 80;
    if (info.offset.x < -threshold) {
      goTo(index + 1);
    } else if (info.offset.x > threshold) {
      goTo(index - 1);
    }
  };

  const offsetPercent = (index * 100) / slideCount;

  return (
    <SectionShell id="screenshots" className="overflow-hidden py-16 md:py-24">
      <Reveal>
        <SectionHeader
          title={carousel.sectionTitle}
          subtitle={carousel.sectionSubtitle}
          className="px-0"
        />
      </Reveal>

      {/* Full-bleed carousel track */}
      <div className="relative -mx-6 md:-mx-10 lg:-mx-16">
        <div className="overflow-hidden">
          <motion.div
            className="flex cursor-grab active:cursor-grabbing"
            drag={reducedMotion ? false : "x"}
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
            animate={{ x: `-${offsetPercent}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ width: `${slideCount * 100}%` }}
          >
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="shrink-0 px-6 md:px-10 lg:px-16"
                style={{ width: `${100 / slideCount}%` }}
              >
                <ScreenshotPlaceholder
                  caption={slide.caption}
                  icon={slide.icon}
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Desktop arrow controls */}
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-4 md:flex md:px-8">
          <CarouselArrow
            direction="prev"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
          />
          <CarouselArrow
            direction="next"
            disabled={index === slideCount - 1}
            onClick={() => goTo(index + 1)}
          />
        </div>

        {/* Dot indicators */}
        <div className="mt-6 flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={clsx(
                "h-2 rounded-full transition-all",
                i === index
                  ? "w-6 bg-wn-text"
                  : "w-2 bg-wn-mono-600 hover:bg-wn-mono-500",
              )}
            />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function CarouselArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="secondary"
      size="sm"
      isDisabled={disabled}
      isIconOnly
      className="pointer-events-auto"
      aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
      onPress={onClick}
    >
      <MaterialSymbol
        name={direction === "prev" ? "arrow_back" : "arrow_forward"}
        className="text-base"
      />
    </Button>
  );
}

/** Placeholder wireframe — swap inner content for real screenshots later. */
function ScreenshotPlaceholder({
  caption,
  icon,
}: {
  caption: string;
  icon: string;
}) {
  return (
    <figure className="overflow-hidden rounded-wn-card border border-dashed border-wn-border-strong bg-wn-surface">
      <div className="relative aspect-video w-full">
        {/* Wireframe grid lines */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-wn-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-wn-border)_1px,transparent_1px)] bg-size-[32px_32px] opacity-40"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-wn-border bg-wn-surface-raised text-wn-text-muted">
            <MaterialSymbol name={icon} className="text-4xl" />
          </span>
          <p className="max-w-md text-center text-wn-small text-wn-text-subtle">
            Screenshot placeholder
          </p>
        </div>
      </div>
      <figcaption className="border-t border-wn-border px-6 py-4 text-wn-small text-wn-text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
