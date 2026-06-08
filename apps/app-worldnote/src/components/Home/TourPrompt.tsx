import {
  AnimatedModal,
  Button,
  getBodyTextStyle,
  getHeadingProps,
  MaterialSymbol,
} from "@worldnote/ui";
import { useTutorial } from "../../hooks/useTutorial.js";

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
      panelClassName="w-full max-w-md rounded-2xl border border-wn-mono-700 bg-wn-mono-900 p-6 text-wn-mono-100 shadow-2xl"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-wn-mono-800">
          <MaterialSymbol name="school" className="text-xl text-wn-mono-50" />
        </span>
        <h2 {...getHeadingProps("h4", { tone: "inverse" })}>
          Take a quick tour?
        </h2>
      </div>
      <p className="mb-6 text-wn-mono-300" style={getBodyTextStyle("small")}>
        Learn how to navigate WorldNote, work with cards, links, notes, and
        tools using a sample world built for the tutorial.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="white"
          size="base"
          className="flex-1"
          isDisabled={isBusy}
          onPress={() => start("home")}
        >
          Take the tour
        </Button>
        <Button
          variant="tertiary"
          size="base"
          className="flex-1"
          isDisabled={isBusy}
          onPress={onDismiss}
        >
          Maybe later
        </Button>
      </div>
    </AnimatedModal>
  );
}
