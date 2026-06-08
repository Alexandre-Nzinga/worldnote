import {
  AnimatedModal,
  Button,
  CloseIconButton,
  getBodyTextStyle,
  getHeadingProps,
} from "@worldnote/ui";
import { useTutorial } from "../../hooks/useTutorial.js";
import { modalPrimaryButtonClassName } from "../Onboarding/fieldClassNames.js";

type TourPromptProps = {
  isOpen: boolean;
  isBusy?: boolean;
  onDismiss: () => void;
};

export function TourPrompt({
  isOpen,
  isBusy = false,
  onDismiss,
}: TourPromptProps) {
  const start = useTutorial((state) => state.start);

  return (
    <AnimatedModal
      isOpen={isOpen}
      onClose={onDismiss}
      closeDisabled={isBusy}
      labelledBy="tour-prompt-title"
      backdropDismissGuardMs={300}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2
            id="tour-prompt-title"
            {...getHeadingProps("h5", { tone: "inverse", weight: "semibold" })}
          >
            Take a quick tour?
          </h2>
          <p style={getBodyTextStyle("small")}>
            Walk through the canvas, cards, links, and tools using a sample
            world built for the tutorial.
          </p>
        </div>
        <CloseIconButton
          aria-label="Close tour prompt"
          isDisabled={isBusy}
          onPress={onDismiss}
        />
      </header>

      <footer className="flex shrink-0 flex-wrap items-center justify-end gap-3">
        <Button
          variant="secondary"
          size="base"
          isDisabled={isBusy}
          onPress={onDismiss}
        >
          Maybe later
        </Button>
        <Button
          variant="white"
          size="base"
          className={modalPrimaryButtonClassName}
          isDisabled={isBusy}
          onPress={() => start("home")}
        >
          Take the tour
        </Button>
      </footer>
    </AnimatedModal>
  );
}
