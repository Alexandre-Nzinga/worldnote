"use client";

import {
  contentItemVariants,
  contentStaggerVariants,
  usePrefersReducedMotion,
} from "@worldnote/ui";
import clsx from "clsx";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Children, isValidElement, type ReactNode } from "react";

type RevealProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  /** When true, children animate in with staggered fade-up. */
  stagger?: boolean;
  className?: string;
};

/**
 * Scroll-triggered reveal wrapper using WorldNote motion presets.
 * Respects the user's reduced-motion preference.
 */
export function Reveal({
  children,
  stagger = false,
  className,
  ...props
}: RevealProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger ? contentStaggerVariants : contentItemVariants}
      className={clsx(className)}
      {...props}
    >
      {stagger
        ? Children.toArray(children).map((child) => (
            <motion.div
              key={isValidElement(child) ? child.key : undefined}
              variants={contentItemVariants}
              className="contents"
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

/** Stagger child wrapper — use inside a Reveal with stagger=false on parent. */
export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={contentItemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Section container with consistent max-width and horizontal padding. */
export function SectionShell({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={clsx("w-full px-6 py-20 md:px-10 lg:px-16", className)}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

/** Shared section heading block (Urbanist title + Inter subtitle). */
export function SectionHeader({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={clsx("mb-12 max-w-2xl", className)}>
      <h2 className="text-wn-h2 font-wn-bold tracking-tight text-wn-text">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-wn-body text-wn-text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}
