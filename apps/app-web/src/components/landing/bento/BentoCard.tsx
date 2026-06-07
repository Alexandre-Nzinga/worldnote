"use client";

import { pressableHover, usePrefersReducedMotion } from "@worldnote/ui";
import { motion } from "framer-motion";

type BentoSpan = "large" | "medium" | "small";

/** Grid placement classes — applied on the RevealItem wrapper, not the card itself. */
export const bentoSpanClass: Record<BentoSpan, string> = {
  large: "md:col-span-2 md:row-span-2",
  medium: "md:col-span-2",
  small: "md:col-span-2 lg:col-span-2",
};

type BentoCardProps = {
  title: string;
  description: string;
};

/** Single bento panel with title and descriptive copy. */
export function BentoCard({ title, description }: BentoCardProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.article
      whileHover={reducedMotion ? undefined : pressableHover}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group flex h-full min-h-[220px] flex-col rounded-wn-card border border-wn-border bg-wn-surface p-6 transition-colors hover:border-wn-border-strong hover:bg-wn-surface-raised md:p-8"
    >
      <h3 className="text-wn-h4 font-wn-semibold text-wn-text">{title}</h3>
      <p className="mt-2 flex-1 text-wn-small leading-relaxed text-wn-text-muted">
        {description}
      </p>
    </motion.article>
  );
}
