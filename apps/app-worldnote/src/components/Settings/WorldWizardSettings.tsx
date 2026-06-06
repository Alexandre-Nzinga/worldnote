import { Input } from "@heroui/react";
import { Button, fieldLabelClassName, fieldStackClassName, getBodyTextStyle, MaterialSymbol } from "@worldnote/ui";
import { useCallback, useEffect, useState } from "react";
import {
  checkOllamaHealth,
  listOllamaModels,
} from "../../services/wizard/ollamaClient.js";
import { defaultWizardSystemPrompt } from "../../services/wizard/prompts.js";
import { primaryAccentRingOnSurfaceClassName } from "../../services/settings/primaryAccentStyles.js";
import type { WizardSettings } from "../../services/settings/settings.js";
import {
  settingsFieldInputClassNames,
  settingsPanelClassName,
  settingsPanelStackClassName,
  settingsRowClassName,
  settingsRowListClassName,
} from "./settingsStyles.js";
import { WorldWizardQuickCommandsSettings } from "./WorldWizardQuickCommandsSettings.js";

const guidelinesTextareaClassName =
  "min-h-[8rem] w-full resize-y rounded-xl border-0 bg-wn-surface-raised px-3 py-2.5 text-sm text-wn-text shadow-none outline-none transition-colors placeholder:text-wn-text-subtle hover:bg-wn-mono-800 focus:bg-wn-mono-800 focus:ring-2 focus:ring-wn-mono-600 disabled:cursor-not-allowed disabled:opacity-50";

type WorldWizardSettingsProps = {
  value: WizardSettings;
  onChange: (next: WizardSettings) => void;
  disabled?: boolean;
};

function ConnectionStatus({ healthy }: { healthy: boolean | null }) {
  if (healthy === null) {
    return (
      <span className="text-sm text-wn-text-muted">Checking connection…</span>
    );
  }
  if (healthy) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-wn-lime-400">
        <MaterialSymbol name="check_circle" className="text-base" />
        Connected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-wn-red-400">
      <MaterialSymbol name="error" className="text-base" />
      Not reachable
    </span>
  );
}

export function WorldWizardSettings({
  value,
  onChange,
  disabled = false,
}: WorldWizardSettingsProps) {
  const [models, setModels] = useState<string[]>([]);
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshModels = useCallback(async (host: string) => {
    setIsRefreshing(true);
    setHealthy(null);
    try {
      const ok = await checkOllamaHealth(host);
      setHealthy(ok);
      if (ok) {
        const found = await listOllamaModels(host);
        setModels(found);
        if (
          value.defaultModel &&
          !found.includes(value.defaultModel) &&
          found.length > 0
        ) {
          // Keep saved model in UI even if missing from Ollama list.
          setModels((current) =>
            current.includes(value.defaultModel)
              ? current
              : [value.defaultModel, ...found],
          );
        }
      } else {
        setModels(
          value.defaultModel ? [value.defaultModel] : [],
        );
      }
    } catch {
      setHealthy(false);
      setModels(value.defaultModel ? [value.defaultModel] : []);
    } finally {
      setIsRefreshing(false);
    }
  }, [value.defaultModel]);

  useEffect(() => {
    void refreshModels(value.host);
  }, [refreshModels, value.host]);

  return (
    <div className={settingsPanelStackClassName}>
      <section className={`${settingsPanelClassName} flex flex-col gap-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ConnectionStatus healthy={healthy} />
          <Button
            variant="secondary"
            size="sm"
            isDisabled={disabled || isRefreshing}
            onPress={() => {
              void refreshModels(value.host);
            }}
            startContent={<MaterialSymbol name="refresh" className="text-base" />}
          >
            Refresh models
          </Button>
        </div>

        <div className={fieldStackClassName}>
          <label htmlFor="wizard-host" className={fieldLabelClassName}>
            Ollama host
          </label>
          <Input
            id="wizard-host"
            aria-label="Ollama host"
            value={value.host}
            isDisabled={disabled}
            placeholder="http://localhost:11434"
            onValueChange={(host) => onChange({ ...value, host })}
            classNames={settingsFieldInputClassNames}
          />
          <p style={getBodyTextStyle("xs")}>
            WorldWizard talks to a local Ollama instance at this address.
          </p>
        </div>
      </section>

      <section className={settingsPanelClassName}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className={fieldLabelClassName}>Available models</span>
          {value.defaultModel ? (
            <span className="text-xs text-wn-text-muted">
              Default: {value.defaultModel}
            </span>
          ) : null}
        </div>

        {isRefreshing ? (
          <p style={getBodyTextStyle("small")}>Loading models…</p>
        ) : models.length === 0 ? (
          <p style={getBodyTextStyle("small")}>
            {healthy === false
              ? "Start Ollama, then refresh to list installed models."
              : "No models found. Pull a model in Ollama, then refresh."}
          </p>
        ) : (
          <ul className={settingsRowListClassName}>
            {models.map((model) => {
              const isSelected = value.defaultModel === model;
              return (
                <li key={model} className={settingsRowClassName}>
                  <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={isSelected}
                    onClick={() => onChange({ ...value, defaultModel: model })}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? `bg-wn-surface-raised text-wn-text ${primaryAccentRingOnSurfaceClassName}`
                        : "text-wn-text hover:bg-wn-surface-raised"
                    }`}
                  >
                    <span className="truncate text-sm font-medium">{model}</span>
                    {isSelected ? (
                      <MaterialSymbol
                        name="check"
                        className="shrink-0 text-base text-wn-text"
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={`${settingsPanelClassName} flex flex-col gap-3`}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wizard-guidelines" className={fieldLabelClassName}>
            Behavior guidelines
          </label>
          <textarea
            id="wizard-guidelines"
            aria-label="WorldWizard behavior guidelines"
            disabled={disabled}
            value={value.guidelines ?? ""}
            placeholder="e.g. Write in a terse, noir tone. Favor political intrigue over combat. Always address characters by their titles."
            onChange={(event) =>
              onChange({ ...value, guidelines: event.target.value })
            }
            className={guidelinesTextareaClassName}
          />
          <p style={getBodyTextStyle("xs")}>
            Optional instructions appended to the wizard&apos;s system prompt.
            Leave empty to use the default narrator persona.
          </p>
        </div>

        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-wn-text-muted hover:text-wn-text">
            View default persona
          </summary>
          <p className="mt-2 rounded-xl bg-wn-surface-raised px-3 py-2.5 text-xs leading-relaxed text-wn-text-muted">
            {defaultWizardSystemPrompt()}
          </p>
        </details>
      </section>

      <WorldWizardQuickCommandsSettings
        value={value.quickCommands ?? []}
        onChange={(quickCommands) => onChange({ ...value, quickCommands })}
        disabled={disabled}
      />
    </div>
  );
}
