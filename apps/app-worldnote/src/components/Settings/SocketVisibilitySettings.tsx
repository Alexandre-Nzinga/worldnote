import {
  CARD_TYPE_LABELS,
  listSocketsForCardType,
  SOCKET_REGISTRY,
} from "@worldnote/shared";
import {
  Eyebrow,
  MaterialSymbol,
  wnDescriptionClassName,
  wnHintClassName,
  wnTitleClassName,
} from "@worldnote/ui";
import type { VisibleSocketsByCardType } from "../../services/settings/settings.js";
import { formatSocketId } from "../../services/settings/visibleSocketSettings.js";
import { objectKeys } from "../../services/objectKeys.js";
import {
  settingsPanelClassName,
  settingsPanelStackClassName,
  settingsRowClassName,
  settingsRowListClassName,
} from "./settingsStyles.js";

type SocketVisibilitySettingsProps = {
  value: VisibleSocketsByCardType;
  onChange: (next: VisibleSocketsByCardType) => void;
  disabled?: boolean;
};

export function SocketVisibilitySettings({
  value,
  onChange,
  disabled = false,
}: SocketVisibilitySettingsProps) {
  const cardTypes = objectKeys(SOCKET_REGISTRY);

  return (
    <div className={settingsPanelStackClassName}>
      <div>
        <span className={wnTitleClassName}>Canvas sockets</span>
        <p className={`mt-1.5 ${wnDescriptionClassName}`}>
          Choose which connection handles appear on cards in the world canvas.
          Link cards on the canvas to fill connection fields in the inspector.
        </p>
      </div>

      {cardTypes.map((cardType) => {
        const sockets = listSocketsForCardType(cardType);
        if (sockets.length === 0) {
          return null;
        }
        const cardSettings = value[cardType] ?? {};
        const typeLabel = CARD_TYPE_LABELS[cardType] ?? cardType;

        return (
          <section
            key={cardType}
            className={`${settingsPanelClassName} scroll-mt-6`}
          >
            <Eyebrow showDot={false} className="mb-4">
              {typeLabel}
            </Eyebrow>
            <ul className={settingsRowListClassName}>
              {sockets.map(({ id, descriptor }) => {
                const isVisible = cardSettings[id] ?? false;
                return (
                  <li
                    key={id}
                    className={`${settingsRowClassName} flex items-center gap-3`}
                  >
                    <button
                      type="button"
                      className="shrink-0 rounded-lg p-1 text-wn-text-muted transition-colors hover:bg-wn-surface-raised hover:text-wn-text disabled:opacity-40"
                      aria-label={
                        isVisible
                          ? `Hide ${formatSocketId(id)} socket`
                          : `Show ${formatSocketId(id)} socket`
                      }
                      aria-pressed={isVisible}
                      disabled={disabled}
                      onClick={() =>
                        onChange({
                          ...value,
                          [cardType]: {
                            ...cardSettings,
                            [id]: !isVisible,
                          },
                        })
                      }
                    >
                      <MaterialSymbol
                        name={isVisible ? "visibility" : "visibility_off"}
                        className="text-xl"
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-wn-text">
                        {formatSocketId(id)}
                      </p>
                      <p className={`mt-0.5 ${wnHintClassName}`}>
                        {descriptor.cardinality === "many" ? "many" : "single"}{" "}
                        · accepts {descriptor.accepts.join(", ")}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
