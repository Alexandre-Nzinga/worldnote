import { Button, fieldLabelClassName, getBodyTextStyle } from "@worldnote/ui";
import { useCallback } from "react";
import { useSettings } from "../../hooks/useSettings.js";
import {
  DEFAULT_PRIMARY_COLOR,
  PRIMARY_COLOR_OPTIONS,
  PRIMARY_COLOR_RUNTIME_CLASSES,
  applyPrimaryColorToDocument,
  normalizePrimaryColor,
  primaryColorOptionLabel,
  primaryColorSwatchClassName,
  primaryColorSwatchRingClassName,
  type PrimaryColorToken,
} from "../../services/settings/primaryColorSettings.js";
import { primaryAccentRingOnSurfaceClassName } from "../../services/settings/primaryAccentStyles.js";
import { settingsPanelClassName } from "./settingsStyles.js";

const swatchClassName =
  "h-9 w-9 shrink-0 rounded-full ring-1 ring-wn-border ring-inset";

const swatchButtonClassName =
  "flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-wn-surface-raised";

const selectedSwatchButtonClassName = `bg-wn-surface-raised ${primaryAccentRingOnSurfaceClassName}`;

type PrimaryColorSettingProps = {
  disabled?: boolean;
};

/** Accent color for primary CTAs (Save, Create, etc.). Applies immediately on select. */
export function PrimaryColorSetting({ disabled = false }: PrimaryColorSettingProps) {
  const settings = useSettings((state) => state.settings);
  const save = useSettings((state) => state.save);
  const current = normalizePrimaryColor(settings?.primaryColor);

  const handleSelect = useCallback(
    (value: PrimaryColorToken) => {
      if (!settings || value === current) {
        return;
      }
      applyPrimaryColorToDocument(value);
      void save({ ...settings, primaryColor: value });
    },
    [current, save, settings],
  );

  return (
    <section className={settingsPanelClassName}>
      <div aria-hidden className={`hidden ${PRIMARY_COLOR_RUNTIME_CLASSES}`} />
      <div className="flex flex-col gap-1">
        <span className={fieldLabelClassName}>Primary color</span>
        <p style={getBodyTextStyle("small")}>
          Accent for main actions
        </p>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {PRIMARY_COLOR_OPTIONS.map((option) => {
          const isSelected = option.value === current;
          return (
            <li key={option.value}>
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={option.label}
                disabled={disabled}
                onClick={() => handleSelect(option.value)}
                className={`w-full ${swatchButtonClassName} ${
                  isSelected ? selectedSwatchButtonClassName : ""
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span
                  aria-hidden
                  className={`${swatchClassName} ${primaryColorSwatchClassName(option.value)} ${primaryColorSwatchRingClassName(option.value)}`}
                />
                <span className="max-w-full truncate text-center text-[10px] font-medium text-wn-text-muted">
                  {option.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          variant="white"
          size="sm"
          className="pointer-events-none"
          tabIndex={-1}
        >
          Preview
        </Button>
        <span className="text-xs text-wn-text-muted">
          {primaryColorOptionLabel(current)}
          {current === DEFAULT_PRIMARY_COLOR ? " (default)" : ""}
        </span>
      </div>
    </section>
  );
}
