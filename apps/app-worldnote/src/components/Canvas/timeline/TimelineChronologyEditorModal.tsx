import { Input } from "@heroui/react";
import type { ChronologyEntry } from "@worldnote/shared";
import {
  AnimatedModal,
  Button,
  EnumComboBox,
  wnLabelClassName,
  getBodyTextStyle,
  getHeadingProps,
} from "@worldnote/ui";
import { useEffect, useMemo, useState } from "react";
import {
  darkFieldInputClassNames,
  modalPrimaryButtonClassName,
} from "../../Onboarding/fieldClassNames.js";
import {
  listChronologyParentOptions,
  resolveChronologyParentEntry,
  validateChronologyYears,
} from "../../../services/timeline/timelineChronology.js";
import {
  formatYearInput,
  parseYearInput,
} from "../../../services/timeline/calendarFormat.js";
import { normalizeChronologyColor } from "../../../services/timeline/chronologyPeriodColors.js";
import { ChronologyColorPicker } from "./ChronologyColorPicker.js";

type TimelineChronologyEditorModalProps = {
  isOpen: boolean;
  entry: ChronologyEntry | null;
  chronology: ChronologyEntry[];
  onClose: () => void;
  onSave: (entry: ChronologyEntry) => Promise<void>;
};

export function TimelineChronologyEditorModal({
  isOpen,
  entry,
  chronology,
  onClose,
  onSave,
}: TimelineChronologyEditorModalProps) {
  const [name, setName] = useState("");
  const [startYearInput, setStartYearInput] = useState("");
  const [endYearInput, setEndYearInput] = useState("");
  const [parentId, setParentId] = useState("");
  const [color, setColor] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !entry) {
      return;
    }
    setName(entry.name);
    setStartYearInput(formatYearInput(entry.start_year));
    setEndYearInput(formatYearInput(entry.end_year));
    setParentId(entry.parent_id ?? "");
    setColor(entry.color ?? "");
    setError(null);
    setIsSaving(false);
  }, [entry, isOpen]);

  const parentOptions = useMemo(
    () =>
      listChronologyParentOptions(chronology, entry?.id ?? null).map(
        (option) => ({
          value: option.value,
          label: option.label,
        }),
      ),
    [chronology, entry?.id],
  );

  const isNew =
    entry !== null && !chronology.some((item) => item.id === entry.id);

  const handleSave = async () => {
    if (!entry) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    const startYear = parseYearInput(startYearInput);
    const endYear = parseYearInput(endYearInput);
    if (startYear === undefined || endYear === undefined) {
      setError("Start and end years are required.");
      return;
    }

    const parentEntry = resolveChronologyParentEntry(
      parentId.trim() || null,
      chronology,
    );
    const yearError = validateChronologyYears(startYear, endYear, parentEntry);
    if (yearError) {
      setError(yearError);
      return;
    }

    setIsSaving(true);
    setError(null);

    const normalizedColor = normalizeChronologyColor(color);

    try {
      const nextEntry: ChronologyEntry = {
        id: entry.id,
        name: trimmedName,
        start_year: startYear,
        end_year: endYear,
        parent_id: parentId.trim() || null,
        ...(normalizedColor ? { color: normalizedColor } : {}),
      };

      await onSave(nextEntry);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save entry.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatedModal
      isOpen={isOpen && entry !== null}
      onClose={onClose}
      closeDisabled={isSaving}
      labelledBy="timeline-chronology-editor-title"
      panelClassName="relative z-20 flex w-full max-w-md flex-col gap-4 rounded-2xl border border-wn-border bg-wn-surface p-5 shadow-2xl"
    >
      {entry ? (
        <>
          <header className="flex flex-col gap-1">
            <h2
              id="timeline-chronology-editor-title"
              {...getHeadingProps("h5", {
                tone: "inverse",
                weight: "semibold",
              })}
            >
              {isNew ? "New period" : "Edit period"}
            </h2>
            <p style={getBodyTextStyle("small")} className="text-wn-text-muted">
              Nest periods inside each other — e.g. Middle Ages → 12th century.
            </p>
          </header>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="chrono-name" className={wnLabelClassName}>
                Name
              </label>
              <Input
                id="chrono-name"
                autoFocus
                value={name}
                onValueChange={setName}
                classNames={darkFieldInputClassNames}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="chrono-start" className={wnLabelClassName}>
                  Start year
                </label>
                <Input
                  id="chrono-start"
                  inputMode="numeric"
                  value={startYearInput}
                  onValueChange={setStartYearInput}
                  placeholder="0"
                  classNames={darkFieldInputClassNames}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="chrono-end" className={wnLabelClassName}>
                  End year
                </label>
                <Input
                  id="chrono-end"
                  inputMode="numeric"
                  value={endYearInput}
                  onValueChange={setEndYearInput}
                  placeholder="100"
                  classNames={darkFieldInputClassNames}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className={wnLabelClassName}>Parent</span>
              <EnumComboBox
                label="Parent period"
                hideLabel
                allowEmpty
                value={parentId}
                onChange={setParentId}
                options={parentOptions}
              />
            </div>

            <ChronologyColorPicker
              value={color}
              onChange={setColor}
              disabled={isSaving}
            />

            {error ? (
              <p style={getBodyTextStyle("small")} className="text-wn-red-400">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onPress={onClose} isDisabled={isSaving}>
              Cancel
            </Button>
            <Button
              className={modalPrimaryButtonClassName}
              onPress={() => {
                void handleSave();
              }}
              isDisabled={isSaving}
            >
              Save
            </Button>
          </div>
        </>
      ) : null}
    </AnimatedModal>
  );
}
