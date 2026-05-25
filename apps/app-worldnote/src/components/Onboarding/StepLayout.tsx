import { Button, getHeadingStyle } from "@worldnote/ui";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  actionItemVariants,
  contentItemVariants,
  contentStaggerVariants,
} from "./onboardingMotion.js";

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
  return (
    <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
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
          className="mb-8 text-wn-mono-50"
          style={{
            ...getHeadingStyle("h1"),
            fontSize: "48px",
            fontWeight: "var(--font-weight-wn-semibold)",
            lineHeight: 1.1,
            color: "var(--color-wn-mono-50)",
          }}
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
            className="h-12 w-full rounded-full border-0 bg-wn-mono-50 text-base font-semibold text-wn-mono-950 shadow-none hover:bg-wn-mono-100 data-[hover=true]:bg-wn-mono-100"
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
