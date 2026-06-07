import {
  actionItemVariants,
  Button,
  contentItemVariants,
  contentStaggerVariants,
  getHeadingProps,
  WorldNoteLogo,
} from "@worldnote/ui";
import { motion } from "framer-motion";
import { useResolvedTheme } from "../../theme/ThemeProvider.js";
import { OnboardingWelcomeVisual } from "./OnboardingWelcomeVisual.js";

type WelcomeStepProps = {
  onNext: () => void;
};

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const theme = useResolvedTheme();
  const titleHeadingProps = getHeadingProps("h1", {
    tone: "inverse",
    weight: "semibold",
    className: "mb-3",
  });

  return (
    <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <OnboardingWelcomeVisual />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between px-8 pb-10 pt-8 md:px-14 md:pb-14">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <WorldNoteLogo
            variant="icon"
            tone={theme === "dark" ? "white" : "black"}
            className="h-7 w-7 opacity-90"
            alt="WorldNote"
          />
          <span className="text-2xl font-semibold text-wn-mono-50">
            WorldNote
          </span>
        </motion.div>

        <motion.div
          className="w-full max-w-[520px]"
          variants={contentStaggerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="mb-2 text-sm text-wn-mono-300"
            variants={contentItemVariants}
          >
            Lets get started
          </motion.div>

          <motion.h1
            className={titleHeadingProps.className}
            style={{
              ...titleHeadingProps.style,
              fontSize: "clamp(2.25rem, 5vw, 3rem)",
              lineHeight: 1.1,
            }}
            variants={contentItemVariants}
          >
            Welcome to WorldNote
          </motion.h1>

          <motion.p
            className="mb-8 max-w-md text-base text-wn-mono-400"
            variants={contentItemVariants}
          >
            Map characters, places, and lore on an infinite canvas, then
            connect the dots across your world.
          </motion.p>

          <motion.div variants={actionItemVariants}>
            <Button
              variant="white"
              size="base"
              fullWidth
              className="!h-12 text-base"
              onPress={onNext}
            >
              Next
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
