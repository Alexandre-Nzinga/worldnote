import { wnDescriptionClassName, wnTitleClassName } from "@worldnote/ui";
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
import {
  settingsPanelClassName,
  settingsPanelStackClassName,
} from "./settingsStyles.js";
import { TimelineEraSuffixSetting } from "./TimelineEraSuffixSetting.js";

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
          <section key={module.id} className={settingsPanelClassName}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className={wnTitleClassName}>{module.name}</span>
                <p className={`mt-0.5 ${wnDescriptionClassName}`}>
                  {module.description}
                </p>
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
            {checked && module.id === "familyTree" ? (
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
            {checked && module.id === "timeline" ? (
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
