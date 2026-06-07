import { usePrefersReducedMotion } from "@worldnote/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ONBOARDING_WELCOME_CAROUSEL_FADE_MS,
  ONBOARDING_WELCOME_CAROUSEL_INTERVAL_MS,
  onboardingWelcomeSlideSrc,
  onboardingWelcomeSlides,
} from "./onboardingWelcomeCarousel.js";

export function OnboardingWelcomeVisual() {
  const reducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = onboardingWelcomeSlides.length;

  useEffect(() => {
    if (reducedMotion || slideCount <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, ONBOARDING_WELCOME_CAROUSEL_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [reducedMotion, slideCount]);

  const activeSlide = onboardingWelcomeSlides[activeIndex];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-wn-mono-950"
    >
      <AnimatePresence mode="sync">
        <motion.img
          key={activeSlide.id}
          src={onboardingWelcomeSlideSrc(activeSlide)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={
            reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }
          }
          animate={{ opacity: 1, scale: 1 }}
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            opacity: {
              duration: reducedMotion ? 0 : ONBOARDING_WELCOME_CAROUSEL_FADE_MS / 1000,
              ease: "easeInOut",
            },
            scale: {
              duration: ONBOARDING_WELCOME_CAROUSEL_INTERVAL_MS / 1000,
              ease: "linear",
            },
          }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-wn-mono-950/35" />
      <div className="absolute inset-0 bg-linear-to-t from-wn-mono-950 via-wn-mono-950/75 to-wn-mono-950/20" />
      <div className="absolute inset-0 bg-linear-to-r from-wn-mono-950/70 via-transparent to-wn-mono-950/30" />

      {slideCount > 1 ? (
        <div className="absolute bottom-8 right-8 flex gap-1.5 md:bottom-14 md:right-14">
          {onboardingWelcomeSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={[
                "h-1 rounded-full transition-all duration-500",
                index === activeIndex
                  ? "w-5 bg-wn-mono-100"
                  : "w-1 bg-wn-mono-100/35",
              ].join(" ")}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
