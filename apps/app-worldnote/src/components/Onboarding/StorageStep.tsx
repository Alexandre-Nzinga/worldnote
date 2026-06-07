import { Input } from "@heroui/react";
import { Button, fieldLabelClassName } from "@worldnote/ui";
import { useCallback, useMemo, useState } from "react";
import { pickDirectory } from "../../services/desktop/pickDirectory.js";
import { darkFieldInputClassNames } from "./fieldClassNames.js";
import { StepLayout } from "./StepLayout.js";

const WORLDNOTE_FOLDER = "WorldNote";

type StorageStepProps = {
  parentDir: string | null;
  onParentDirChange: (path: string) => void;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  error: string | null;
};

export function StorageStep({
  parentDir,
  onParentDirChange,
  onBack,
  onSave,
  isSaving,
  error,
}: StorageStepProps) {
  const [browseError, setBrowseError] = useState<string | null>(null);
  const [isBrowsing, setIsBrowsing] = useState(false);

  const displayPath = useMemo(() => {
    if (!parentDir) {
      return "";
    }
    const normalized = parentDir.replace(/[/\\]+$/, "");
    return `${normalized}\\${WORLDNOTE_FOLDER}`;
  }, [parentDir]);

  const handleBrowse = useCallback(async () => {
    setBrowseError(null);
    setIsBrowsing(true);
    try {
      const selection = await pickDirectory("Choose where to store your worlds");
      if (selection) {
        onParentDirChange(selection);
      }
    } catch (browseErr) {
      setBrowseError(
        browseErr instanceof Error
          ? browseErr.message
          : "Could not open the folder picker. Restart the desktop app and try again.",
      );
    } finally {
      setIsBrowsing(false);
    }
  }, [onParentDirChange]);

  return (
    <StepLayout
      eyebrow={
        <button
          type="button"
          className="text-wn-mono-50 transition-opacity hover:opacity-80"
          onClick={onBack}
        >
          ← Back
        </button>
      }
      title="Where should we store your worlds?"
      actionLabel="Save"
      onAction={onSave}
      actionDisabled={!parentDir || isSaving}
    >
      <div className="flex flex-col gap-1">
        <span className={fieldLabelClassName}>Browse location</span>
        <div className="flex gap-2">
          <Input
            isReadOnly
            aria-label="Browse location"
            placeholder="Choose a folder on your machine"
            value={displayPath}
            isDisabled={isBrowsing || isSaving}
            classNames={{
              ...darkFieldInputClassNames,
              base: "flex-1",
            }}
          />
          <Button
            variant="secondary"
            size="base"
            isDisabled={isBrowsing || isSaving}
            onPress={() => {
              void handleBrowse();
            }}
          >
            {isBrowsing ? "Opening…" : "Browse…"}
          </Button>
        </div>

        {browseError ? (
          <p className="mt-2 text-sm text-wn-red-400" role="alert">
            {browseError}
          </p>
        ) : null}
        {error ? (
          <p className="mt-2 text-sm text-wn-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </StepLayout>
  );
}
