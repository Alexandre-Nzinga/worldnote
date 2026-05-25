import { Button } from "@worldnote/ui";
import { useCallback, useMemo, useState } from "react";
import { pickDirectory } from "../../services/desktop/pickDirectory.js";
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
      stepNumber={2}
      actionLabel="Save"
      onAction={onSave}
      actionDisabled={!parentDir || isSaving}
    >
      <div className="flex flex-col gap-3">
        <span className="text-sm text-wn-mono-50">Browse location</span>

        <button
          type="button"
          disabled={isBrowsing || isSaving}
          className="w-full rounded-xl border border-wn-mono-700 bg-wn-mono-900 px-4 py-3 text-left transition-colors hover:border-wn-mono-500 hover:bg-wn-mono-800 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            void handleBrowse();
          }}
        >
          <span className="block text-xs text-wn-mono-500">WorldNote folder</span>
          <span className="mt-1 block truncate text-sm text-wn-mono-50">
            {displayPath || "Choose a folder on your machine"}
          </span>
        </button>

        <Button
          variant="secondary"
          size="base"
          className="self-start"
          isDisabled={isBrowsing || isSaving}
          onPress={() => {
            void handleBrowse();
          }}
        >
          {isBrowsing ? "Opening…" : "Browse…"}
        </Button>

        {browseError ? (
          <p className="text-sm text-wn-red-400" role="alert">
            {browseError}
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-wn-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </StepLayout>
  );
}
