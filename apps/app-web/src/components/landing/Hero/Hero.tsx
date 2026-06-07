"use client";

import {
  Button,
  contentItemVariants,
  contentStaggerVariants,
  usePrefersReducedMotion,
} from "@worldnote/ui";
import { motion } from "framer-motion";
import { landingCopy } from "@/components/landing/shared/copy";
import { useGithubRelease } from "@/hooks/useGithubRelease";
import { RELEASES_PAGE_URL } from "@/services/github/releases";

export function Hero() {
  const { label, version, primaryHref, isLoading } = useGithubRelease();
  const { hero } = landingCopy;
  const reducedMotion = usePrefersReducedMotion();

  const motionProps = reducedMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "visible" as const,
        variants: contentStaggerVariants,
      };

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 md:px-10 md:pt-28 lg:px-16 lg:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-wn-surface-raised/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-wn-mono-800/20 blur-3xl" />
      </div>

      <motion.div
        {...motionProps}
        className="mx-auto flex max-w-4xl flex-col items-center text-center"
      >
        <motion.h1
          variants={contentItemVariants}
          className="text-wn-display font-wn-bold tracking-tight text-wn-text"
        >
          {hero.headline}
        </motion.h1>

        <motion.p
          variants={contentItemVariants}
          className="mt-6 max-w-2xl text-wn-body leading-relaxed text-wn-text-muted md:text-lg"
        >
          {hero.subheadline}
        </motion.p>

        <motion.div
          variants={contentItemVariants}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button
              variant="white"
              size="base"
              as="a"
              href={primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="!min-h-11 !px-8 !py-3 sm:!px-10"
            >
              {label}
            </Button>

            <Button
              variant="secondary"
              size="base"
              as="a"
              href={RELEASES_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="!min-h-11 !px-8 !py-3 sm:!px-10"
            >
              {hero.secondaryCta}
            </Button>
          </div>

          {/* Live version tag — hidden until release data loads */}
          {!isLoading && version ? (
            <p className="text-wn-small font-wn-medium text-wn-text-subtle">
              {version}
            </p>
          ) : null}
        </motion.div>
      </motion.div>
    </section>
  );
}
