import { Input } from "@heroui/react";
import { CARD_TYPE_LABELS } from "@worldnote/shared";
import {
  Button,
  MaterialSymbol,
  wnDescriptionClassName,
  wnHintClassName,
  wnLabelClassName,
  wnTitleClassName,
} from "@worldnote/ui";
import { useCallback, useState } from "react";
import { MaterialIconPicker } from "./MaterialIconPicker.js";
import {
  CREATABLE_CARD_TYPES,
  isNewCardType,
} from "../../services/crudWorldCard/creatableCardTypes.js";
import {
  BUILTIN_WIZARD_QUICK_COMMANDS,
  createCustomWizardQuickCommand,
  describeQuickCommandAvailability,
  type WizardQuickCommandConfig,
} from "../../services/settings/wizardQuickCommands.js";
import { ToggleSwitch } from "../shell/ToggleSwitch.js";
import {
  settingsFieldInputClassNames,
  settingsPanelClassName,
  settingsRowClassName,
  settingsRowListClassName,
} from "./settingsStyles.js";

const promptTextareaClassName =
  "min-h-[6rem] w-full resize-y rounded-xl border-0 bg-wn-surface-raised px-3 py-2.5 text-sm text-wn-text shadow-none outline-none transition-colors placeholder:text-wn-text-subtle hover:bg-wn-mono-800 focus:bg-wn-mono-800 focus:ring-2 focus:ring-wn-mono-600 disabled:cursor-not-allowed disabled:opacity-50";

type WorldWizardQuickCommandsSettingsProps = {
  value: WizardQuickCommandConfig[];
  onChange: (next: WizardQuickCommandConfig[]) => void;
  disabled?: boolean;
};

function updateCommand(
  commands: WizardQuickCommandConfig[],
  id: string,
  patch: Partial<WizardQuickCommandConfig>,
): WizardQuickCommandConfig[] {
  return commands.map((command) =>
    command.id === id ? { ...command, ...patch } : command,
  );
}

function CommandEditor({
  command,
  disabled,
  onChange,
  onDone,
  onDelete,
}: {
  command: WizardQuickCommandConfig;
  disabled?: boolean;
  onChange: (next: WizardQuickCommandConfig) => void;
  onDone: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-wn-surface-raised px-3 py-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={wnLabelClassName} htmlFor={`${command.id}-label`}>
            Label
          </label>
          <Input
            id={`${command.id}-label`}
            value={command.label}
            isDisabled={disabled}
            onValueChange={(label) => onChange({ ...command, label })}
            classNames={settingsFieldInputClassNames}
          />
        </div>
        <MaterialIconPicker
          id={`${command.id}-icon`}
          value={command.icon}
          disabled={disabled}
          ariaLabel={`Choose icon for ${command.label}`}
          onChange={(icon) => onChange({ ...command, icon })}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className={wnLabelClassName}>Action type</span>
          <div className="inline-flex w-fit gap-1 rounded-full bg-wn-surface-sunken p-1">
            {(["chat", "generate-card", "patch-card"] as const).map((kind) => {
              const isActive = command.kind === kind;
              const kindLabel =
                kind === "chat"
                  ? "Chat"
                  : kind === "generate-card"
                    ? "Generate card"
                    : "Patch card";
              return (
                <button
                  key={kind}
                  type="button"
                  disabled={disabled}
                  aria-pressed={isActive}
                  onClick={() =>
                    onChange({
                      ...command,
                      kind,
                      targetCardType:
                        kind === "generate-card"
                          ? command.targetCardType ?? "character"
                          : undefined,
                      patchMode:
                        kind === "patch-card"
                          ? command.patchMode ?? "fill-gaps"
                          : undefined,
                    })
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                    isActive
                      ? "bg-wn-surface text-wn-text shadow-sm"
                      : "text-wn-text-muted hover:text-wn-text"
                  }`}
                >
                  {kindLabel}
                </button>
              );
            })}
          </div>
        </div>
        {command.kind === "generate-card" ? (
          <div className="flex flex-col gap-1.5">
            <label
              className={wnLabelClassName}
              htmlFor={`${command.id}-target`}
            >
              Card type to generate
            </label>
            <select
              id={`${command.id}-target`}
              disabled={disabled}
              value={command.targetCardType ?? "character"}
              onChange={(event) => {
                const nextType = event.target.value;
                if (!isNewCardType(nextType)) {
                  return;
                }
                onChange({
                  ...command,
                  targetCardType: nextType,
                });
              }}
              className="w-full rounded-xl bg-wn-surface-raised px-3 py-2.5 text-sm text-wn-text outline-none transition-colors hover:bg-wn-mono-800 focus:ring-2 focus:ring-wn-mono-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {CREATABLE_CARD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {CARD_TYPE_LABELS[type] ?? type}
                </option>
              ))}
            </select>
          </div>
        ) : command.kind === "patch-card" ? (
          <div className="flex flex-col gap-1.5">
            <label
              className={wnLabelClassName}
              htmlFor={`${command.id}-patch-mode`}
            >
              Patch mode
            </label>
            <select
              id={`${command.id}-patch-mode`}
              disabled={disabled}
              value={command.patchMode ?? "fill-gaps"}
              onChange={(event) => {
                const patchMode =
                  event.target.value === "expand" ? "expand" : "fill-gaps";
                onChange({ ...command, patchMode });
              }}
              className="w-full rounded-xl bg-wn-surface-raised px-3 py-2.5 text-sm text-wn-text outline-none transition-colors hover:bg-wn-mono-800 focus:ring-2 focus:ring-wn-mono-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="fill-gaps">Fill gaps</option>
              <option value="expand">Expand card</option>
            </select>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={wnLabelClassName} htmlFor={`${command.id}-prompt`}>
          Prompt template
        </label>
        <textarea
          id={`${command.id}-prompt`}
          disabled={disabled}
          value={command.promptTemplate}
          onChange={(event) =>
            onChange({ ...command, promptTemplate: event.target.value })
          }
          className={promptTextareaClassName}
        />
        <p className={wnHintClassName}>
          Use {"{{names}}"} where card names should be inserted.
        </p>
      </div>

      <div className="flex flex-col gap-1.5 sm:max-w-[12rem]">
        <label
          className={wnLabelClassName}
          htmlFor={`${command.id}-min-cards`}
        >
          Minimum cards required
        </label>
        <Input
          id={`${command.id}-min-cards`}
          type="number"
          min={1}
          value={String(command.availability.minCards ?? 1)}
          isDisabled={disabled}
          onValueChange={(raw) => {
            const parsed = Number.parseInt(raw, 10);
            onChange({
              ...command,
              availability: {
                ...command.availability,
                minCards: Number.isFinite(parsed) && parsed > 0 ? parsed : 1,
              },
            });
          }}
          classNames={settingsFieldInputClassNames}
        />
      </div>

      {command.builtIn ? (
        <p className={wnHintClassName}>
          Built-in availability:{" "}
          {describeQuickCommandAvailability(
            BUILTIN_WIZARD_QUICK_COMMANDS.find((item) => item.id === command.id)
              ?.availability ?? command.availability,
          )}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {command.builtIn ? (
          <Button
            variant="ghost"
            size="sm"
            isDisabled={disabled}
            onPress={() => {
              const builtin = BUILTIN_WIZARD_QUICK_COMMANDS.find(
                (item) => item.id === command.id,
              );
              if (builtin) {
                onChange({ ...builtin });
              }
            }}
          >
            Reset to default
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            isDisabled={disabled}
            onPress={onDelete}
            className="text-wn-red-400"
          >
            Delete
          </Button>
        )}
        <Button variant="secondary" size="sm" isDisabled={disabled} onPress={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

export function WorldWizardQuickCommandsSettings({
  value,
  onChange,
  disabled = false,
}: WorldWizardQuickCommandsSettingsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleToggle = useCallback(
    (id: string) => {
      onChange(
        updateCommand(value, id, {
          enabled: !value.find((command) => command.id === id)?.enabled,
        }),
      );
    },
    [onChange, value],
  );

  const handleAdd = useCallback(() => {
    const next = createCustomWizardQuickCommand();
    onChange([...value, next]);
    setEditingId(next.id);
  }, [onChange, value]);

  return (
    <section className={`${settingsPanelClassName} flex flex-col gap-4`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <span className={wnTitleClassName}>Quick commands</span>
          <p className={wnDescriptionClassName}>
            Chips shown in WorldWizard when dropped cards match each command&apos;s
            requirements.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          isDisabled={disabled}
          onPress={handleAdd}
          startContent={<MaterialSymbol name="add" className="text-base" />}
          className="shrink-0"
        >
          Add command
        </Button>
      </div>

      <ul className={settingsRowListClassName}>
        {value.map((command) => {
          const isEditing = editingId === command.id;
          return (
            <li key={command.id} className={`${settingsRowClassName} flex flex-col gap-2`}>
              <div className="flex items-center gap-3">
                <MaterialSymbol
                  name={command.icon}
                  className="shrink-0 text-base text-wn-text-muted"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-wn-text">
                    {command.label}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  isDisabled={disabled}
                  onPress={() =>
                    setEditingId(isEditing ? null : command.id)
                  }
                >
                  {isEditing ? "Close" : "Edit"}
                </Button>

                <ToggleSwitch
                  checked={command.enabled}
                  disabled={disabled}
                  ariaLabel={
                    command.enabled
                      ? `Disable ${command.label}`
                      : `Enable ${command.label}`
                  }
                  onChange={() => handleToggle(command.id)}
                />
              </div>

              {isEditing ? (
                <CommandEditor
                  command={command}
                  disabled={disabled}
                  onChange={(next) => {
                    onChange(
                      value.map((item) =>
                        item.id === command.id ? next : item,
                      ),
                    );
                  }}
                  onDone={() => setEditingId(null)}
                  onDelete={
                    command.builtIn
                      ? undefined
                      : () => {
                          onChange(value.filter((item) => item.id !== command.id));
                          setEditingId(null);
                        }
                  }
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
