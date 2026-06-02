import { MaterialSymbol } from "@worldnote/ui";
import type { WizardActionPreset } from "../../../services/wizard/index.js";

type WizardActionChipsProps = {
  actions: WizardActionPreset[];
  disabled: boolean;
  onRun: (preset: WizardActionPreset) => void;
};

export function WizardActionChips({
  actions,
  disabled,
  onRun,
}: WizardActionChipsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={disabled}
          onClick={() => onRun(action)}
          className="flex items-center gap-1.5 rounded-full border border-wn-mono-700 bg-wn-mono-950 px-3 py-1.5 text-xs font-medium text-wn-mono-200 transition-colors hover:border-wn-azure-500 hover:text-wn-mono-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MaterialSymbol name={action.icon} className="text-sm" />
          {action.label}
        </button>
      ))}
    </div>
  );
}
