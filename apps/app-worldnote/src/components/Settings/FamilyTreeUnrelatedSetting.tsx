import {
  MaterialSymbol,
  wnDescriptionClassName,
  wnSubtitleClassName,
} from "@worldnote/ui";
import {
  familyTreeUnrelatedModeLabel,
  normalizeFamilyTreeUnrelatedMode,
  type FamilyTreeUnrelatedMode,
} from "../../services/settings/familyTreeSettings.js";
const UNRELATED_MODE_OPTIONS: Array<{
  value: FamilyTreeUnrelatedMode;
  icon: string;
  description: string;
}> = [
  {
    value: "dim",
    icon: "contrast",
    description: "Keep unrelated characters visible but faded",
  },
  {
    value: "hide",
    icon: "visibility_off",
    description: "Remove unrelated characters from the canvas",
  },
];

type FamilyTreeUnrelatedSettingProps = {
  value: FamilyTreeUnrelatedMode | undefined;
  onChange: (value: FamilyTreeUnrelatedMode) => void;
  disabled?: boolean;
};

export function FamilyTreeUnrelatedSetting({
  value,
  onChange,
  disabled = false,
}: FamilyTreeUnrelatedSettingProps) {
  const current = normalizeFamilyTreeUnrelatedMode(value);

  return (
    <section className="mt-4">
      <div className="mb-4 flex flex-col gap-1">
        <span className={wnSubtitleClassName}>Unrelated characters</span>
        <p className={wnDescriptionClassName}>
          Choose what happens to characters with no kinship path to the selected
          anchor.
        </p>
      </div>

      <div className="inline-flex w-full flex-col gap-1 rounded-xl bg-wn-surface-sunken p-1 sm:flex-row">
        {UNRELATED_MODE_OPTIONS.map((option) => {
          const isActive = option.value === current;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => {
                if (option.value !== current) {
                  onChange(option.value);
                }
              }}
              className={[
                "flex min-w-0 flex-1 items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isActive
                  ? "bg-wn-surface-raised text-wn-text shadow-sm"
                  : "text-wn-text-muted hover:text-wn-text",
              ].join(" ")}
            >
              <MaterialSymbol
                name={option.icon}
                className="mt-0.5 shrink-0 text-base"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {familyTreeUnrelatedModeLabel(option.value)}
                </span>
                <span className="mt-0.5 block text-xs text-wn-text-muted">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
