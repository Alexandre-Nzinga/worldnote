/**
 * Onboarding welcome background carousel.
 *
 * Add a new slide:
 * 1. Drop the image in `public/onboarding/welcome/` (PNG or JPG).
 * 2. Append an entry below with a unique `id` and matching `file` name.
 *
 * Images are served from `/onboarding/welcome/<file>` at runtime.
 */

export type OnboardingWelcomeSlide = {
  /** Stable key for React and future per-slide options. */
  id: string;
  /** Filename inside `public/onboarding/welcome/`. */
  file: string;
  alt: string;
};

/** How long each slide stays visible before advancing. */
export const ONBOARDING_WELCOME_CAROUSEL_INTERVAL_MS = 10_000;

/** Crossfade duration when switching slides. */
export const ONBOARDING_WELCOME_CAROUSEL_FADE_MS = 1_200;

const WELCOME_ASSET_BASE = "/onboarding/welcome";

export const onboardingWelcomeSlides = [
  {
    id: "tycho-station",
    file: "tycho-station.png",
    alt: "Orbital shipyard and space station under construction",
  },
  {
    id: "sci-fi-invasion",
    file: "sci-fi-invasion.png",
    alt: "Science fiction invasion at sunset over a coastal plain",
  },
  {
    id: "battle-of-the-trident",
    file: "battle-of-the-trident.png",
    alt: "Fantasy battle between armored knights in a river",
  },
  {
    id: "kings-landing",
    file: "kings-landing.png",
    alt: "Fantasy coastal city with castle towers at golden hour",
  },
] satisfies OnboardingWelcomeSlide[];

export function onboardingWelcomeSlideSrc(
  slide: OnboardingWelcomeSlide,
): string {
  return `${WELCOME_ASSET_BASE}/${slide.file}`;
}
