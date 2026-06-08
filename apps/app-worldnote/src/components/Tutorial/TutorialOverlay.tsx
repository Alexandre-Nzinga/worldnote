import { usePrefersReducedMotion } from "@worldnote/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTutorial } from "../../hooks/useTutorial.js";
import { TUTORIAL_STEPS } from "./tutorialSteps.js";
import {
  measureTutorialTarget,
  paddedSpotlightRect,
} from "./tutorialTarget.js";
import { TutorialCallout } from "./TutorialCallout.js";

const FOCUS_OVERLAY_ARM_MS = 450;

function isPointerInRect(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): boolean {
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

type SpotlightBackdropProps = {
  rect: DOMRect | null;
};

function SpotlightBackdrop({ rect }: SpotlightBackdropProps) {
  const reducedMotion = usePrefersReducedMotion();
  const panelClassName = "pointer-events-auto fixed z-[100] bg-black/65";

  if (!rect) {
    return (
      <motion.div
        className={panelClassName}
        style={{ inset: 0 }}
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reducedMotion ? undefined : { opacity: 0 }}
      />
    );
  }

  const top = rect.top;
  const left = rect.left;
  const width = rect.width;
  const height = rect.height;

  return (
    <>
      <motion.div
        className={panelClassName}
        style={{ top: 0, left: 0, right: 0, height: top }}
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.div
        className={panelClassName}
        style={{ top: top + height, left: 0, right: 0, bottom: 0 }}
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.div
        className={panelClassName}
        style={{ top, left: 0, width: left, height }}
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.div
        className={panelClassName}
        style={{ top, left: left + width, right: 0, height }}
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.div
        className="pointer-events-none fixed z-[100] rounded-xl ring-2 ring-wn-mono-50/90"
        style={{ top, left, width, height }}
        initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.25 }}
      />
    </>
  );
}

type TutorialOverlayProps = {
  onFinished: () => void;
};

export function TutorialOverlay({ onFinished }: TutorialOverlayProps) {
  const stepIndex = useTutorial((state) => state.stepIndex);
  const isActive = useTutorial((state) => state.isActive);
  const cardAnchorMap = useTutorial((state) => state.cardAnchorMap);
  const stickyNoteAnchorMap = useTutorial((state) => state.stickyNoteAnchorMap);
  const canvasImageAnchorMap = useTutorial(
    (state) => state.canvasImageAnchorMap,
  );
  const needsWorldOpen = useTutorial((state) => state.needsWorldOpen);
  const satisfiedEvents = useTutorial((state) => state.satisfiedEvents);
  const next = useTutorial((state) => state.next);
  const back = useTutorial((state) => state.back);
  const skip = useTutorial((state) => state.skip);

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [focusOverlayVisible, setFocusOverlayVisible] = useState(true);

  const step = isActive ? TUTORIAL_STEPS[stepIndex] : null;
  const canAdvance = !step?.awaitEvent || satisfiedEvents.has(step.awaitEvent);

  const targetRectRef = useRef(targetRect);
  targetRectRef.current = targetRect;

  const advanceStepRef = useRef<() => void>(() => {});
  advanceStepRef.current = () => {
    if (stepIndex >= TUTORIAL_STEPS.length - 1) {
      skip();
      onFinished();
      return;
    }
    next();
  };

  const stepAwaitEventRef = useRef(step?.awaitEvent);
  stepAwaitEventRef.current = step?.awaitEvent;

  const refreshTargetRect = useCallback(() => {
    if (!step) {
      setTargetRect(null);
      return;
    }
    const measured = measureTutorialTarget(step.target, {
      cardAnchorMap,
      stickyNoteAnchorMap,
      canvasImageAnchorMap,
    });
    setTargetRect(
      measured
        ? paddedSpotlightRect(measured, undefined, step.spotlightExpand)
        : null,
    );
  }, [canvasImageAnchorMap, cardAnchorMap, stickyNoteAnchorMap, step]);

  useEffect(() => {
    setFocusOverlayVisible(true);
    refreshTargetRect();
    const interval = window.setInterval(refreshTargetRect, 350);
    window.addEventListener("resize", refreshTargetRect);
    window.addEventListener("scroll", refreshTargetRect, true);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("resize", refreshTargetRect);
      window.removeEventListener("scroll", refreshTargetRect, true);
    };
  }, [refreshTargetRect]);

  useEffect(() => {
    const handleFocusReady = () => {
      window.setTimeout(refreshTargetRect, 450);
    };
    window.addEventListener("wn-tutorial-focus-ready", handleFocusReady);
    return () => {
      window.removeEventListener("wn-tutorial-focus-ready", handleFocusReady);
    };
  }, [refreshTargetRect]);

  useEffect(() => {
    if (!isActive || needsWorldOpen || !step || !focusOverlayVisible) {
      return;
    }

    let armed = false;
    const armTimeoutId: number | undefined = window.setTimeout(() => {
      armed = true;
    }, FOCUS_OVERLAY_ARM_MS);

    const dismissFocusOverlay = () => {
      setFocusOverlayVisible(false);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("[data-tutorial-callout]")
      ) {
        return;
      }

      if (!armed) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const rect = targetRectRef.current;
      if (rect && !isPointerInRect(event.clientX, event.clientY, rect)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      dismissFocusOverlay();

      if (!stepAwaitEventRef.current) {
        event.preventDefault();
        event.stopPropagation();
        advanceStepRef.current();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
    });

    return () => {
      if (armTimeoutId !== undefined) {
        window.clearTimeout(armTimeoutId);
      }
      document.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });
    };
  }, [focusOverlayVisible, isActive, needsWorldOpen, step]);

  if (!isActive || needsWorldOpen || !step) {
    return null;
  }

  const handleSkip = () => {
    skip();
    onFinished();
  };

  const handleNext = () => {
    if (stepIndex >= TUTORIAL_STEPS.length - 1) {
      skip();
      onFinished();
      return;
    }
    next();
  };

  const handleBack = () => {
    back();
  };

  return createPortal(
    <>
      <AnimatePresence>
        {focusOverlayVisible ? (
          <motion.div
            key={`tutorial-focus-${stepIndex}`}
            className="pointer-events-none fixed inset-0 z-[100]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SpotlightBackdrop rect={targetRect} />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <TutorialCallout
        title={step.title}
        body={step.body}
        stepLabel={`Step ${stepIndex + 1} of ${TUTORIAL_STEPS.length}`}
        placement={step.placement ?? "center"}
        calloutPlacement={step.calloutPlacement}
        anchorRect={targetRect}
        canAdvance={canAdvance}
        showBack={stepIndex > 0}
        isLastStep={stepIndex >= TUTORIAL_STEPS.length - 1}
        showExploreHint={focusOverlayVisible}
        exploreHint={
          step.awaitEvent
            ? "Click the highlighted area to try it."
            : "Click the highlighted area to continue."
        }
        onNext={handleNext}
        onBack={handleBack}
        onSkip={handleSkip}
      />
    </>,
    document.body,
  );
}
