import { UserAvatar, wnDescriptionClassName, wnTitleClassName } from "@worldnote/ui";
import {
  AVATAR_COLOR_OPTIONS,
  AVATAR_COLOR_RUNTIME_CLASSES,
  DEFAULT_AVATAR_COLOR,
  avatarColorFallbackClassName,
  avatarColorOptionLabel,
  avatarColorSwatchClassName,
  type AvatarColorToken,
} from "../../services/settings/avatarColorSettings.js";
import { settingsPanelClassName } from "./settingsStyles.js";

const swatchClassName =
  "h-9 w-9 shrink-0 rounded-full ring-1 ring-wn-border ring-inset";

const swatchButtonClassName =
  "flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-wn-surface-raised";

const selectedSwatchButtonClassName =
  "bg-wn-surface-raised shadow-sm ring-2 ring-wn-border-strong ring-offset-2 ring-offset-wn-surface";

type AvatarColorSettingProps = {
  username: string;
  value: AvatarColorToken;
  onChange: (value: AvatarColorToken) => void;
  disabled?: boolean;
};

export function AvatarColorSetting({
  username,
  value,
  onChange,
  disabled = false,
}: AvatarColorSettingProps) {
  return (
    <section className={settingsPanelClassName}>
      <div aria-hidden className={`hidden ${AVATAR_COLOR_RUNTIME_CLASSES}`} />
      <div className="flex flex-col gap-1">
        <span className={wnTitleClassName}>Avatar color</span>
        <p className={wnDescriptionClassName}>
          Gradient behind your profile initial.
        </p>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <UserAvatar
          username={username}
          fallbackClassName={avatarColorFallbackClassName(value)}
          aria-hidden
        />
        <span className="text-xs text-wn-text-muted">
          {avatarColorOptionLabel(value)}
          {value === DEFAULT_AVATAR_COLOR ? " (default)" : ""}
        </span>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {AVATAR_COLOR_OPTIONS.map((option) => {
          const isSelected = option.value === value;
          return (
            <li key={option.value}>
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={option.label}
                disabled={disabled}
                onClick={() => onChange(option.value)}
                className={`w-full ${swatchButtonClassName} ${
                  isSelected ? selectedSwatchButtonClassName : ""
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span
                  aria-hidden
                  className={`${swatchClassName} ${avatarColorSwatchClassName(option.value)}`}
                />
                <span className="max-w-full truncate text-center text-[10px] font-medium text-wn-text-muted">
                  {option.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
