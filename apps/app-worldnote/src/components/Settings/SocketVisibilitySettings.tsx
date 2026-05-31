import {
  CARD_TYPE_LABELS,
  listSocketsForCardType,
  SOCKET_REGISTRY,
  type RegisteredCardType,
} from "@worldnote/shared";
import { MaterialSymbol } from "@worldnote/ui";
import { modalFieldLabelClassName } from "../Onboarding/fieldClassNames.js";
import type { VisibleSocketsByCardType } from "../../services/settings/settings.js";
import { formatSocketId } from "../../services/settings/visibleSocketSettings.js";

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
  const cardTypes = Object.keys(SOCKET_REGISTRY) as RegisteredCardType[];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className={modalFieldLabelClassName}>Canvas sockets</span>
        <p className="text-xs text-wn-mono-500">
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
        const typeLabel =
          CARD_TYPE_LABELS[cardType as keyof typeof CARD_TYPE_LABELS] ??
          cardType;

        return (
          <div key={cardType} className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-wn-mono-500">
              {typeLabel}
            </span>
            <ul className="flex flex-col gap-1.5">
              {sockets.map(({ id, descriptor }) => {
                const isVisible = cardSettings[id] ?? false;
                return (
                  <li
                    key={id}
                    className="flex items-center gap-2 rounded-xl border border-wn-mono-700 bg-wn-mono-950 px-3 py-2"
                  >
                    <button
                      type="button"
                      className="shrink-0 text-wn-mono-400 transition-colors hover:text-wn-mono-50 disabled:opacity-40"
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
                        className="text-base"
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-wn-mono-50">
                        {formatSocketId(id)}
                      </p>
                      <p className="text-xs text-wn-mono-500">
                        {descriptor.cardinality === "many" ? "many" : "single"}{" "}
                        · accepts {descriptor.accepts.join(", ")}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
