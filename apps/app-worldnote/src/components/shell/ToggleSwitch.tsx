import { fieldLabelClassName } from "@worldnote/ui";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
};

export function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-wn-primary" : "bg-wn-surface-raised"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-wn-primary-foreground transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

type ToggleSwitchRowProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

/** Label + switch row (graph view sidebar pattern). */
export function ToggleSwitchRow({
  label,
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={fieldLabelClassName}>{label}</span>
      <ToggleSwitch
        checked={checked}
        onChange={onChange}
        ariaLabel={label}
        disabled={disabled}
      />
    </div>
  );
}
