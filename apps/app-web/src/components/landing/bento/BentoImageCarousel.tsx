"use client";

import { usePrefersReducedMotion } from "@worldnote/ui";
import clsx from "clsx";
import { motion, type PanInfo } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export type BentoCarouselSlide = {
  id: string;
  src: string;
  alt: string;
};

export type BentoImageAspect = "square" | "video";

type BentoImageCarouselProps = {
  slides: readonly BentoCarouselSlide[];
  /** Frame shape — square for 1:1 assets, video for 16:9 UI screenshots. */
  imageAspect?: BentoImageAspect;
  /** Seconds between auto-advances; 0 disables autoplay. */
  intervalSeconds?: number;
};

const aspectClass: Record<BentoImageAspect, string> = {
  square: "aspect-square",
  video: "aspect-video",
};

const imageFitClass: Record<BentoImageAspect, string> = {
  square: "object-contain",
  video: "object-cover object-top",
};

/** Compact image carousel for bento feature cards. */
export function BentoImageCarousel({
  slides,
  imageAspect = "square",
  intervalSeconds = 5,
}: BentoImageCarouselProps) {
  const slideCount = slides.length;
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const goTo = useCallback(
    (next: number) => {
      if (slideCount <= 1) return;
      setIndex(((next % slideCount) + slideCount) % slideCount);
    },
    [slideCount],
  );

  useEffect(() => {
    if (
      reducedMotion ||
      isPaused ||
      intervalSeconds <= 0 ||
      slideCount <= 1
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slideCount);
    }, intervalSeconds * 1000);

    return () => window.clearInterval(timer);
  }, [intervalSeconds, isPaused, reducedMotion, slideCount]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 48;
    if (info.offset.x < -threshold) {
      goTo(index + 1);
    } else if (info.offset.x > threshold) {
      goTo(index - 1);
    }
  };

  if (slideCount === 0) return null;

  const offsetPercent = (index * 100) / slideCount;

  return (
    <div
      className="mt-4 flex flex-col"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div
        className={clsx(
          "relative w-full overflow-hidden rounded-wn-card border border-wn-border bg-black",
          aspectClass[imageAspect],
        )}
      >
        <motion.div
          className="flex h-full cursor-grab active:cursor-grabbing"
          drag={reducedMotion || slideCount <= 1 ? false : "x"}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={{ x: `-${offsetPercent}%` }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          style={{ width: `${slideCount * 100}%` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative h-full shrink-0"
              style={{ width: `${100 / slideCount}%` }}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={imageFitClass[imageAspect]}
                draggable={false}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {slideCount > 1 ? (
        <div className="mt-3 flex justify-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show slide ${i + 1} of ${slideCount}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => goTo(i)}
              className={clsx(
                "h-1.5 rounded-full transition-all",
                i === index
                  ? "w-5 bg-wn-text"
                  : "w-1.5 bg-wn-mono-600 hover:bg-wn-mono-500",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
