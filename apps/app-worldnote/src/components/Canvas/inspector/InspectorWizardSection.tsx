import type { WorldCard } from "@worldnote/shared";
import { WorldNoteLogo } from "@worldnote/ui";
import type { WizardSuggestion } from "../../../services/wizard/analyzeSuggestions.js";
import {
  describeInspectorExpandAction,
  describeInspectorFillGapsAction,
} from "../../../services/settings/wizardQuickCommands.js";
import {
  WizardActionChip,
  WizardActionIconChip,
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
  const logoTone = "white";
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
      {healthy === false ? (
        <p className="mb-2 text-xs text-wn-mono-400">
          Ollama offline — configure in Settings.
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
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
        {onOpenWizard ? (
          <WizardActionIconChip
            aria-label="Open WorldWizard"
            tooltip="Open WorldWizard"
            disabled={wizardDisabled}
            icon={
              <WorldNoteLogo
                variant="icon"
                format="svg"
                tone={logoTone}
                className="h-4 w-4 opacity-90"
                alt=""
              />
            }
            onClick={onOpenWizard}
          />
        ) : null}
      </div>
    </section>
  );
}
