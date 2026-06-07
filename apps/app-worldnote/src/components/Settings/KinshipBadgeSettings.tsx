import { CardTypePill } from "@worldnote/canvas";
import { wnDescriptionClassName, wnSubtitleClassName } from "@worldnote/ui";
import {
  KINSHIP_BADGE_SWATCH_DEFAULTS,
  hasKinshipBadgeOverride,
  kinshipBadgeBackgroundSelectValue,
  kinshipBadgeTextSelectValue,
  resetKinshipBadgeOverride,
  resolveKinshipBadgeStyle,
  setKinshipBadgeBackground,
  setKinshipBadgeTextColor,
  type KinshipBadgeOverride,
} from "../../services/settings/kinshipBadgeSettings.js";
import { BadgeColorPicker } from "./BadgeColorPicker.js";
import { settingsRowClassName } from "./settingsStyles.js";

type KinshipBadgeSettingsProps = {
  value: KinshipBadgeOverride;
  onChange: (next: KinshipBadgeOverride) => void;
  disabled?: boolean;
};

export function KinshipBadgeSettings({
  value,
  onChange,
  disabled = false,
}: KinshipBadgeSettingsProps) {
  const resolved = resolveKinshipBadgeStyle(value);
  const hasOverride = hasKinshipBadgeOverride(value);

  return (
    <section className="mt-4">
      <div className="mb-4 flex flex-col gap-1">
        <span className={wnSubtitleClassName}>Kinship label colors</span>
        <p className={wnDescriptionClassName}>
          Customize the relation badge shown on character cards when Family Tree
          is active.
        </p>
      </div>

      <div className={settingsRowClassName}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <CardTypePill
              className={resolved.badgeClassName}
              textClassName={resolved.badgeTextColor}
            >
              Son
            </CardTypePill>
            {hasOverride ? (
              <button
                type="button"
                className="shrink-0 text-sm font-medium text-wn-text-muted transition-colors hover:text-wn-text disabled:opacity-40"
                disabled={disabled}
                onClick={() => onChange(resetKinshipBadgeOverride())}
              >
                Reset
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BadgeColorPicker
              kind="background"
              swatchDefaults={KINSHIP_BADGE_SWATCH_DEFAULTS}
              label="Background"
              ariaLabel="Kinship label background"
              disabled={disabled}
              value={kinshipBadgeBackgroundSelectValue(value)}
              onChange={(next) => onChange(setKinshipBadgeBackground(value, next))}
            />
            <BadgeColorPicker
              kind="text"
              swatchDefaults={KINSHIP_BADGE_SWATCH_DEFAULTS}
              label="Text"
              ariaLabel="Kinship label text color"
              disabled={disabled}
              value={kinshipBadgeTextSelectValue(value)}
              onChange={(next) => onChange(setKinshipBadgeTextColor(value, next))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
