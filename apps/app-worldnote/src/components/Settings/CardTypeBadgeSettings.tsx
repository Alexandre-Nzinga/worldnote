import { CardTypePill } from "@worldnote/canvas";
import {
  CARD_CLASS_BY_TYPE,
  CARD_CLASS_LABELS,
  CARD_CLASS_ORDER,
  CARD_TYPE_LABELS,
} from "@worldnote/shared";
import { Eyebrow, wnDescriptionClassName, wnTitleClassName } from "@worldnote/ui";
import {
  badgeBackgroundSelectValue,
  badgeTextSelectValue,
  CONFIGURED_CARD_TYPES,
  resetCardBadgeOverride,
  resolveCardBadgeStyle,
  setCardBadgeBackground,
  setCardBadgeTextColor,
  type CardTypeBadgeOverrides,
} from "../../services/settings/cardTypeBadgeSettings.js";
import { BadgeColorPicker } from "./BadgeColorPicker.js";
import {
  settingsPanelClassName,
  settingsPanelStackClassName,
  settingsRowClassName,
  settingsRowListClassName,
} from "./settingsStyles.js";

type CardTypeBadgeSettingsProps = {
  value: CardTypeBadgeOverrides;
  onChange: (next: CardTypeBadgeOverrides) => void;
  disabled?: boolean;
};

export function CardTypeBadgeSettings({
  value,
  onChange,
  disabled = false,
}: CardTypeBadgeSettingsProps) {
  const typesByClass = CARD_CLASS_ORDER.map((cardClass) => ({
    cardClass,
    types: CONFIGURED_CARD_TYPES.filter(
      (cardType) => CARD_CLASS_BY_TYPE[cardType] === cardClass,
    ),
  })).filter((group) => group.types.length > 0);

  return (
    <div className={settingsPanelStackClassName}>
      <div>
        <span className={wnTitleClassName}>Card type colors</span>
        <p className={`mt-1.5 ${wnDescriptionClassName}`}>
          Customize badge background and text colors for each card type on the
          canvas and in the inspector.
        </p>
      </div>

      {typesByClass.map(({ cardClass, types }) => (
        <section
          key={cardClass}
          className={`${settingsPanelClassName} scroll-mt-6`}
        >
          <Eyebrow showDot={false} className="mb-4">
            {CARD_CLASS_LABELS[cardClass]}
          </Eyebrow>
          <ul className={settingsRowListClassName}>
            {types.map((cardType) => {
              const label = CARD_TYPE_LABELS[cardType] ?? cardType;
              const resolved = resolveCardBadgeStyle(cardType, value);
              const hasOverride = cardType in value;

              return (
                <li key={cardType} className={settingsRowClassName}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <CardTypePill
                        className={resolved.badgeClassName}
                        textClassName={resolved.badgeTextColor}
                      >
                        {label}
                      </CardTypePill>
                      {hasOverride ? (
                        <button
                          type="button"
                          className="shrink-0 text-sm font-medium text-wn-text-muted transition-colors hover:text-wn-text disabled:opacity-40"
                          disabled={disabled}
                          onClick={() =>
                            onChange(resetCardBadgeOverride(value, cardType))
                          }
                        >
                          Reset
                        </button>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <BadgeColorPicker
                        kind="background"
                        cardType={cardType}
                        label="Background"
                        ariaLabel={`${label} badge background`}
                        disabled={disabled}
                        value={badgeBackgroundSelectValue(cardType, value)}
                        onChange={(next) =>
                          onChange(
                            setCardBadgeBackground(value, cardType, next),
                          )
                        }
                      />
                      <BadgeColorPicker
                        kind="text"
                        cardType={cardType}
                        label="Text"
                        ariaLabel={`${label} badge text color`}
                        disabled={disabled}
                        value={badgeTextSelectValue(cardType, value)}
                        onChange={(next) =>
                          onChange(setCardBadgeTextColor(value, cardType, next))
                        }
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
