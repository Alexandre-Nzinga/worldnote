import {
  Button,
  contentItemVariants,
  contentStaggerVariants,
  getBodyTextStyle,
  getHeadingProps,
  MaterialSymbol,
  WorldNoteLogo,
  type ButtonVariant,
} from "@worldnote/ui";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
export type RichEmptyStateAction = {
  label: string;
  icon?: string;
  variant?: ButtonVariant;
  onPress: () => void;
  isDisabled?: boolean;
};

type RichEmptyStateProps = {
  title: string;
  description: string;
  actions?: RichEmptyStateAction[];
  children?: ReactNode;
  className?: string;
  compact?: boolean;
};

const panelClassName =
  "flex flex-col items-center rounded-wn-card border border-dashed border-wn-mono-800 bg-wn-mono-950/20 text-center";

const logoWrapClassName =
  "mb-4 inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-wn-surface-raised px-3.5";

export function RichEmptyState({
  title,
  description,
  actions = [],
  children,
  className,
  compact = false,
}: RichEmptyStateProps) {
  const paddingClassName = compact ? "px-6 py-8" : "px-8 py-12";
  const titleLevel = compact ? "h6" : "h5";

  return (
    <motion.div
      className={`${panelClassName} ${paddingClassName} ${className ?? ""}`}
      variants={contentStaggerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={logoWrapClassName} variants={contentItemVariants}>
        <WorldNoteLogo
          variant="icon"
          tone="white"
          className="h-5 opacity-90"
          alt=""
        />
      </motion.div>

      <motion.h3
        {...getHeadingProps(titleLevel, {
          tone: "inverse",
          weight: "medium",
          className: "mb-2 max-w-md",
        })}
        variants={contentItemVariants}
      >
        {title}
      </motion.h3>

      <motion.p
        className="mb-6 max-w-md text-wn-mono-400"
        style={getBodyTextStyle("small")}
        variants={contentItemVariants}
      >
        {description}
      </motion.p>

      {children ? (
        <motion.div
          className="mb-6 w-full max-w-md"
          variants={contentItemVariants}
        >
          {children}
        </motion.div>
      ) : null}

      {actions.length > 0 ? (
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          variants={contentItemVariants}
        >
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant ?? "white"}
              size="sm"
              isDisabled={action.isDisabled}
              onPress={action.onPress}
              startContent={
                action.icon ? (
                  <MaterialSymbol name={action.icon} className="text-base" />
                ) : undefined
              }
            >
              {action.label}
            </Button>
          ))}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
