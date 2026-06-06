import {
  actionItemVariants,
  Button,
  contentItemVariants,
  contentStaggerVariants,
  getHeadingProps,
} from "@worldnote/ui";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type StepLayoutProps = {
  eyebrow: ReactNode;
  title: string;
  stepNumber?: number;
  totalSteps?: number;
  children?: ReactNode;
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
};

export function StepLayout({
  eyebrow,
  title,
  stepNumber,
  totalSteps = 3,
  children,
  actionLabel,
  onAction,
  actionDisabled = false,
}: StepLayoutProps) {
  const titleHeadingProps = getHeadingProps("h1", {
    tone: "inverse",
    weight: "semibold",
    className: "mb-8",
  });

  return (
    <main className="scrollbar-wn flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
      <motion.div
        className="my-auto w-full max-w-[520px]"
        variants={contentStaggerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mb-6 flex items-center justify-between gap-4"
          variants={contentItemVariants}
        >
          <div className="text-sm text-wn-mono-50">{eyebrow}</div>
          {stepNumber !== undefined && stepNumber > 0 ? (
            <span className="shrink-0 rounded-full border border-wn-mono-700 bg-wn-mono-900 px-3 py-1 text-[11px] font-medium text-wn-mono-400">
              Step {stepNumber} of {totalSteps}
            </span>
          ) : null}
        </motion.div>

        <motion.h1
          className={titleHeadingProps.className}
          style={{ ...titleHeadingProps.style, fontSize: "48px", lineHeight: 1.1 }}
          variants={contentItemVariants}
        >
          {title}
        </motion.h1>

        {children ? (
          <motion.div className="mb-8" variants={contentItemVariants}>
            {children}
          </motion.div>
        ) : null}

        <motion.div variants={actionItemVariants}>
          <Button
            variant="white"
            size="base"
            fullWidth
            className="!h-12 text-base"
            isDisabled={actionDisabled}
            onPress={onAction}
          >
            {actionLabel}
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}
