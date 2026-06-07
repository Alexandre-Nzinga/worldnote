import { fieldLabelClassName, MaterialSymbol, getBodyTextStyle } from "@worldnote/ui";
import { useCallback } from "react";
import { useSettings } from "../../hooks/useSettings.js";
import type { ThemePreference } from "../../services/settings/settings.js";
import { applyThemeClass } from "../../theme/ThemeProvider.js";
import { settingsPanelClassName } from "./settingsStyles.js";

type ThemeOption = {
  value: ThemePreference;
  label: string;
  icon: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  { value: "light", label: "Light", icon: "light_mode" },
  { value: "dark", label: "Dark", icon: "dark_mode" },
  { value: "system", label: "System", icon: "brightness_auto" },
];

type ThemeSettingProps = {
  disabled?: boolean;
};

/** Light / Dark / System selector. Applies immediately by persisting the setting. */
export function ThemeSetting({ disabled = false }: ThemeSettingProps) {
  const settings = useSettings((state) => state.settings);
  const save = useSettings((state) => state.save);
  const current = settings?.theme ?? "system";

  const handleSelect = useCallback(
    (value: ThemePreference) => {
      if (!settings || value === current) {
        return;
      }
      if (value === "light" || value === "dark") {
        applyThemeClass(value);
      } else {
        applyThemeClass(
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
        );
      }
      try {
        window.localStorage.setItem("wn-theme", value);
      } catch {
        // Boot script falls back to system/dark when storage is unavailable.
      }
      void save({ ...settings, theme: value });
    },
    [current, save, settings],
  );

  return (
    <section className={settingsPanelClassName}>
      <div className="flex flex-col gap-1">
        <span className={fieldLabelClassName}>Theme</span>
        <p style={getBodyTextStyle("small")}>
          Choose how WorldNote looks. System follows your operating system.
        </p>
      </div>
      <div className="mt-4 inline-flex w-fit gap-1 rounded-full bg-wn-surface-sunken p-1">
        {THEME_OPTIONS.map((option) => {
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
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
