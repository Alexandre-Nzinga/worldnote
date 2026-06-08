import {
  AnimatedPopover,
  Button,
  contentItemVariants,
  contentStaggerVariants,
  getBodyTextStyle,
  getHeadingProps,
  usePrefersReducedMotion,
} from "@worldnote/ui";
import { motion } from "framer-motion";
import type { TutorialPlacement, TutorialStep } from "./tutorialSteps.js";

type TutorialCalloutProps = {
  title: string;
  body: string;
  stepLabel: string;
  placement: TutorialPlacement;
  calloutPlacement?: TutorialStep["calloutPlacement"];
  anchorRect: DOMRect | null;
  canAdvance: boolean;
  showBack: boolean;
  isLastStep: boolean;
  showExploreHint?: boolean;
  exploreHint?: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
};

const CALLOUT_WIDTH = 320;
const VIEWPORT_MARGIN = 16;
const CALLOUT_GAP = 16;

function calloutPosition(
  placement: TutorialPlacement,
  anchorRect: DOMRect | null,
  calloutPlacement?: TutorialStep["calloutPlacement"],
): { top: number; left: number } {
  if (calloutPlacement === "corner-top-left") {
    return { top: VIEWPORT_MARGIN + 56, left: VIEWPORT_MARGIN };
  }

  if (placement === "center" || !anchorRect) {
    return {
      top: Math.max(VIEWPORT_MARGIN, window.innerHeight / 2 - 160),
      left: Math.max(
        VIEWPORT_MARGIN,
        window.innerWidth / 2 - CALLOUT_WIDTH / 2,
      ),
    };
  }

  let top = anchorRect.top;
  let left = anchorRect.left;

  switch (placement) {
    case "top":
      top = anchorRect.top - CALLOUT_GAP - 180;
      left = anchorRect.left + anchorRect.width / 2 - CALLOUT_WIDTH / 2;
      break;
    case "bottom":
      top = anchorRect.bottom + CALLOUT_GAP;
      left = anchorRect.left + anchorRect.width / 2 - CALLOUT_WIDTH / 2;
      break;
    case "left":
      top = anchorRect.top + anchorRect.height / 2 - 90;
      left = anchorRect.left - CALLOUT_GAP - CALLOUT_WIDTH;
      break;
    case "right":
      top = anchorRect.top + anchorRect.height / 2 - 90;
      left = anchorRect.right + CALLOUT_GAP;
      break;
    default:
      break;
  }

  const maxLeft = window.innerWidth - CALLOUT_WIDTH - VIEWPORT_MARGIN;
  const maxTop = window.innerHeight - 220 - VIEWPORT_MARGIN;

  return {
    top: Math.min(Math.max(VIEWPORT_MARGIN, top), maxTop),
    left: Math.min(Math.max(VIEWPORT_MARGIN, left), maxLeft),
  };
}

export function TutorialCallout({
  title,
  body,
  stepLabel,
  placement,
  calloutPlacement,
  anchorRect,
  canAdvance,
  showBack,
  isLastStep,
  showExploreHint = false,
  exploreHint = "Click the highlighted area to continue.",
  onNext,
  onBack,
  onSkip,
}: TutorialCalloutProps) {
  const reducedMotion = usePrefersReducedMotion();
  const position = calloutPosition(placement, anchorRect, calloutPlacement);

  return (
    <div
      className="pointer-events-none fixed z-[101]"
      data-tutorial-callout
      style={{
        top: position.top,
        left: position.left,
        width: CALLOUT_WIDTH,
      }}
    >
      <AnimatedPopover
        isOpen
        className="pointer-events-auto rounded-2xl border border-wn-mono-700 bg-wn-mono-900 p-5 shadow-2xl"
      >
        <motion.div
          variants={reducedMotion ? undefined : contentStaggerVariants}
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
        >
          <motion.p
            className="mb-2 text-xs uppercase tracking-wide text-wn-mono-400"
            style={getBodyTextStyle("small")}
            variants={contentItemVariants}
          >
            {stepLabel}
          </motion.p>
          <motion.h2
            {...getHeadingProps("h5", { tone: "inverse", className: "mb-2" })}
            variants={contentItemVariants}
          >
            {title}
          </motion.h2>
          <motion.p
            className="mb-5 text-wn-mono-300"
            style={getBodyTextStyle("small")}
            variants={contentItemVariants}
          >
            {body}
          </motion.p>
          {showExploreHint ? (
            <motion.p
              className="mb-4 text-wn-mono-500"
              style={getBodyTextStyle("small")}
              variants={contentItemVariants}
            >
              {exploreHint}
            </motion.p>
          ) : null}
          <motion.div
            className="flex flex-wrap items-center gap-2"
            variants={contentItemVariants}
          >
            {showBack ? (
              <Button variant="tertiary" size="sm" onPress={onBack}>
                Back
              </Button>
            ) : null}
            <Button
              variant="white"
              size="sm"
              isDisabled={!canAdvance}
              onPress={onNext}
            >
              {isLastStep ? "Finish" : canAdvance ? "Next" : "Waiting…"}
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              className="ml-auto"
              onPress={onSkip}
            >
              Skip tour
            </Button>
          </motion.div>
        </motion.div>
      </AnimatedPopover>
    </div>
  );
}
