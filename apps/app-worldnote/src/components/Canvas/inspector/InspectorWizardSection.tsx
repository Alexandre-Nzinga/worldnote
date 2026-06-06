import type { WorldCard } from "@worldnote/shared";
import type { WizardSuggestion } from "../../../services/wizard/analyzeSuggestions.js";
import {
  describeInspectorExpandAction,
  describeInspectorFillGapsAction,
} from "../../../services/settings/wizardQuickCommands.js";
import {
  WizardActionChip,
} from "../wizard/WizardActionChip.js";
import type { InspectorWizardStatus } from "./useInspectorWizard.js";

type InspectorWizardSectionProps = {
  status: InspectorWizardStatus;
  healthy: boolean | null;
  activeAction: "expand" | "fill-gaps" | "suggestion" | null;
  activeSuggestionId: string | null;
  suggestions: WizardSuggestion[];
  isBusy: boolean;
  selectedCard: WorldCard;
  onExpand: () => void;
  onFillGaps: () => void;
  onRunSuggestion: (suggestion: WizardSuggestion) => void;
  onOpenWizard?: () => void;
};

export function InspectorWizardSection({
  status,
  healthy,
  activeAction,
  activeSuggestionId,
  suggestions,
  isBusy,
  selectedCard,
  onExpand,
  onFillGaps,
  onRunSuggestion,
  onOpenWizard,
}: InspectorWizardSectionProps) {
  const wizardDisabled =
    isBusy || status === "generating" || healthy !== true;
  const isGenerating = status === "generating";
  const isFillingGaps = isGenerating && activeAction === "fill-gaps";
  const isExpanding = isGenerating && activeAction === "expand";

  return (
    <section
      className="shrink-0 border-b border-wn-mono-800 px-5 py-2.5"
      aria-label="WorldWizard actions"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-wn-mono-400">
          WorldWizard
        </span>
        {onOpenWizard ? (
          <button
            type="button"
            className="text-xs text-wn-mono-400 underline-offset-2 hover:text-wn-mono-200 hover:underline"
            disabled={wizardDisabled}
            onClick={onOpenWizard}
          >
            Open panel
          </button>
        ) : null}
      </div>

      {healthy === false ? (
        <p className="mb-2 text-xs text-wn-mono-400">
          Ollama offline — configure in Settings.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <WizardActionChip
          icon="auto_fix_high"
          label={isFillingGaps ? "Filling…" : "Fill gaps"}
          tooltip={describeInspectorFillGapsAction(selectedCard.name)}
          disabled={wizardDisabled}
          busy={isFillingGaps}
          onClick={onFillGaps}
        />
        <WizardActionChip
          icon="auto_awesome"
          label={isExpanding ? "Expanding…" : "Expand card"}
          tooltip={describeInspectorExpandAction(selectedCard.name)}
          disabled={wizardDisabled}
          busy={isExpanding}
          onClick={onExpand}
        />
        {suggestions.map((suggestion) => {
          const isThisSuggestionGenerating =
            isGenerating &&
            activeAction === "suggestion" &&
            activeSuggestionId === suggestion.id;

          return (
            <WizardActionChip
              key={suggestion.id}
              icon="edit_note"
              label={
                isThisSuggestionGenerating ? "Generating…" : suggestion.label
              }
              disabled={wizardDisabled}
              busy={isThisSuggestionGenerating}
              tooltip={suggestion.message}
              aria-label={suggestion.message}
              onClick={() => onRunSuggestion(suggestion)}
            />
          );
        })}
      </div>

      <p className="mt-2 text-[11px] text-wn-mono-500">
        Actions apply to {selectedCard.name}. Linked suggestions may update
        other cards.
      </p>
    </section>
  );
}
