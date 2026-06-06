import { fieldLabelClassName, MaterialSymbol, getBodyTextStyle } from "@worldnote/ui";
import { BUILTIN_MODULES } from "../../services/modules/moduleRegistry.js";
import {
  isModuleEnabledInSettings,
  setModuleEnabled,
  type ModulesSettings,
} from "../../services/settings/modulesSettings.js";
import type {
  FamilyTreeUnrelatedMode,
  KinshipBadgeOverride,
} from "../../services/settings/settings.js";
import { ToggleSwitch } from "../shell/ToggleSwitch.js";
import { FamilyTreeUnrelatedSetting } from "./FamilyTreeUnrelatedSetting.js";
import { KinshipBadgeSettings } from "./KinshipBadgeSettings.js";
import { TimelineEraSuffixSetting } from "./TimelineEraSuffixSetting.js";
import {
  settingsPanelClassName,
  settingsPanelStackClassName,
} from "./settingsStyles.js";

type ModulesSettingsPanelProps = {
  value: ModulesSettings;
  onChange: (value: ModulesSettings) => void;
  kinshipLabelColors: KinshipBadgeOverride;
  onKinshipLabelColorsChange: (value: KinshipBadgeOverride) => void;
  familyTreeUnrelatedMode: FamilyTreeUnrelatedMode | undefined;
  onFamilyTreeUnrelatedModeChange: (value: FamilyTreeUnrelatedMode) => void;
  timelineEraSuffix: string;
  onTimelineEraSuffixChange: (value: string) => void;
  timelineWorldName?: string;
  disabled?: boolean;
};

export function ModulesSettingsPanel({
  value,
  onChange,
  kinshipLabelColors,
  onKinshipLabelColorsChange,
  familyTreeUnrelatedMode,
  onFamilyTreeUnrelatedModeChange,
  timelineEraSuffix,
  onTimelineEraSuffixChange,
  timelineWorldName,
  disabled = false,
}: ModulesSettingsPanelProps) {
  return (
    <div className={settingsPanelStackClassName}>
      {BUILTIN_MODULES.map((module) => {
        const checked = isModuleEnabledInSettings(value, module.id);
        return (
          <section
            key={module.id}
            className={settingsPanelClassName}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 gap-3">
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-wn-surface-raised text-wn-text-muted"
                  aria-hidden
                >
                  <MaterialSymbol name={module.icon} className="text-[20px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className={fieldLabelClassName}>{module.name}</span>
                  <p className="mt-0.5" style={getBodyTextStyle("small")}>
                    {module.description}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={checked}
                onChange={(next) => {
                  onChange(setModuleEnabled(value, module.id, next));
                }}
                ariaLabel={`Enable ${module.name}`}
                disabled={disabled}
              />
            </div>
            {module.id === "familyTree" ? (
              <>
                <FamilyTreeUnrelatedSetting
                  value={familyTreeUnrelatedMode}
                  onChange={onFamilyTreeUnrelatedModeChange}
                  disabled={disabled}
                />
                <KinshipBadgeSettings
                  value={kinshipLabelColors}
                  onChange={onKinshipLabelColorsChange}
                  disabled={disabled}
                />
              </>
            ) : null}
            {module.id === "timeline" ? (
              <TimelineEraSuffixSetting
                value={timelineEraSuffix}
                onChange={onTimelineEraSuffixChange}
                worldName={timelineWorldName}
                disabled={disabled}
              />
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
