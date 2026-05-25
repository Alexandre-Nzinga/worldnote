import {
  type StepDirection,
  stepTransition,
  stepTransitionVariants,
  WorldNoteLogo,
} from "@worldnote/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { useSettings } from "../../hooks/useSettings.js";
import {
  ensureWorldnoteRoot,
  type AppSettings,
} from "../../services/settings/settings.js";
import { StorageStep } from "./StorageStep.js";
import { UsernameStep } from "./UsernameStep.js";
import { WelcomeStep } from "./WelcomeStep.js";

type OnboardingStep = "welcome" | "username" | "storage";

const STEP_ORDER: OnboardingStep[] = ["welcome", "username", "storage"];

type OnboardingProps = {
  onComplete: () => void;
};

export function Onboarding({ onComplete }: OnboardingProps) {
  const save = useSettings((state) => state.save);
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [direction, setDirection] = useState<StepDirection>(1);
  const stepIndexRef = useRef(STEP_ORDER.indexOf("welcome"));

  const [username, setUsername] = useState("");
  const [parentDir, setParentDir] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToStep = useCallback((next: OnboardingStep) => {
    const nextIndex = STEP_ORDER.indexOf(next);
    setDirection(nextIndex >= stepIndexRef.current ? 1 : -1);
    stepIndexRef.current = nextIndex;
    setStep(next);
  }, []);

  const handleSave = useCallback(async () => {
    if (!parentDir) {
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const worldnoteRoot = await ensureWorldnoteRoot(parentDir);
      const settings: AppSettings = {
        username: username.trim(),
        worldnoteRoot,
        onboardedAt: Math.floor(Date.now() / 1000),
        visibleSockets: {},
      };
      await save(settings);
      onComplete();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : String(saveError),
      );
    } finally {
      setIsSaving(false);
    }
  }, [onComplete, parentDir, save, username]);

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return <WelcomeStep onNext={() => goToStep("username")} />;
      case "username":
        return (
          <UsernameStep
            value={username}
            onChange={setUsername}
            onNext={() => goToStep("storage")}
          />
        );
      case "storage":
        return (
          <StorageStep
            parentDir={parentDir}
            onParentDirChange={setParentDir}
            onBack={() => goToStep("username")}
            onSave={() => {
              void handleSave();
            }}
            isSaving={isSaving}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-wn-mono-950 text-wn-mono-100">
      <motion.header
        className="flex items-center gap-3 px-[46px] pt-7"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <WorldNoteLogo
          variant="icon"
          tone="white"
          className="h-7 w-7 opacity-90"
          alt="WorldNote"
        />
        <span className="text-2xl font-semibold text-wn-mono-50">WorldNote</span>
      </motion.header>

      <div className="flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepTransitionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition}
            className="flex min-h-0 flex-1 flex-col"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
