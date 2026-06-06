import type { WizardActionPreset } from "../../../services/wizard/index.js";
import { describeWizardQuickCommand } from "../../../services/settings/wizardQuickCommands.js";
import { WizardActionChip } from "./WizardActionChip.js";

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
        <WizardActionChip
          key={action.id}
          icon={action.icon}
          label={action.label}
          tooltip={describeWizardQuickCommand(action)}
          disabled={disabled}
          onClick={() => onRun(action)}
        />
      ))}
    </div>
  );
}
