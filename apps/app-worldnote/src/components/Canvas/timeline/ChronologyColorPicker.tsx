import { wnLabelClassName } from "@worldnote/ui";
import {
  CHRONOLOGY_PERIOD_COLOR_OPTIONS,
  normalizeChronologyColor,
} from "../../../services/timeline/chronologyPeriodColors.js";
import { primaryAccentRingOnSurfaceClassName } from "../../../services/settings/primaryAccentStyles.js";

const swatchClassName =
  "h-8 w-8 shrink-0 rounded-full ring-1 ring-wn-border ring-inset";

const swatchButtonClassName =
  "flex flex-col items-center gap-1 rounded-xl p-1.5 transition-colors hover:bg-wn-surface-raised";

const selectedSwatchButtonClassName = `bg-wn-surface-raised ${primaryAccentRingOnSurfaceClassName}`;

type ChronologyColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function ChronologyColorPicker({
  value,
  onChange,
  disabled = false,
}: ChronologyColorPickerProps) {
  const normalizedValue = normalizeChronologyColor(value) ?? "";

  return (
    <div className="flex flex-col gap-2">
      <span className={wnLabelClassName}>Color</span>
      <fieldset
        className="m-0 min-w-0 border-0 p-0"
        aria-label="Period color"
        disabled={disabled}
      >
        <div className="grid grid-cols-6 gap-1">
          <button
            type="button"
            aria-pressed={normalizedValue === ""}
            aria-label="Default color"
            disabled={disabled}
            onClick={() => onChange("")}
            className={`${swatchButtonClassName} ${
              normalizedValue === "" ? selectedSwatchButtonClassName : ""
            }`}
          >
            <span
              className={`${swatchClassName} bg-wn-surface-sunken`}
              aria-hidden
            />
            <span className="max-w-full truncate text-center text-[10px] leading-tight text-wn-text-muted">
              Default
            </span>
          </button>

          {CHRONOLOGY_PERIOD_COLOR_OPTIONS.map((option) => {
            const isSelected = normalizedValue === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                aria-label={option.label}
                disabled={disabled}
                onClick={() => onChange(option.value)}
                className={`${swatchButtonClassName} ${
                  isSelected ? selectedSwatchButtonClassName : ""
                }`}
              >
                <span
                  className={swatchClassName}
                  style={{ backgroundColor: option.value }}
                  aria-hidden
                />
                <span className="max-w-full truncate text-center text-[10px] leading-tight text-wn-text-muted">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
