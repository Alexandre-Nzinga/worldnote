import { MaterialSymbol, getBodyTextStyle } from "@worldnote/ui";
import { useCallback } from "react";
import { useSettings } from "../../hooks/useSettings.js";
import {
  normalizeUnitSystem,
  type UnitSystem,
} from "../../services/settings/unitSystem.js";
import { settingsPanelClassName } from "./settingsStyles.js";

const UNIT_OPTIONS: Array<{
  value: UnitSystem;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    value: "metric",
    label: "Metric",
    icon: "straighten",
    description: "kg, cm, °C, m, km/h",
  },
  {
    value: "imperial",
    label: "Imperial",
    icon: "architecture",
    description: "lb, ft/in, °F",
  },
];

type UnitSystemSettingProps = {
  disabled?: boolean;
};

/**
 * Global measurement display preference. Values are always stored in metric
 * (kg, cm, °C); this setting only affects labels and formatted display.
 */
export function UnitSystemSetting({ disabled = false }: UnitSystemSettingProps) {
  const settings = useSettings((state) => state.settings);
  const save = useSettings((state) => state.save);
  const current = normalizeUnitSystem(settings?.unitSystem);

  const handleSelect = useCallback(
    (value: UnitSystem) => {
      if (!settings || value === current) {
        return;
      }
      void save({ ...settings, unitSystem: value });
    },
    [current, save, settings],
  );

  return (
    <section className={settingsPanelClassName}>
      <p style={getBodyTextStyle("small")}>
        Choose how measurements appear in card properties.
        Data is always saved in metric units (kg, cm, °C, m, km/h).
      </p>
      <div className="mt-4 inline-flex w-fit gap-1 rounded-full bg-wn-surface-sunken p-1">
        {UNIT_OPTIONS.map((option) => {
          const isActive = option.value === current;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => handleSelect(option.value)}
              className={[
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isActive
                  ? "bg-wn-surface-raised text-wn-text shadow-sm"
                  : "text-wn-text-muted hover:text-wn-text",
              ].join(" ")}
            >
              <MaterialSymbol name={option.icon} className="text-base" />
              <span>{option.label}</span>
              <span className="text-xs text-wn-text-muted">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
