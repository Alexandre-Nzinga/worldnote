import { Input } from "@heroui/react";
import { Button } from "@worldnote/ui";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "../../hooks/useSettings.js";
import { normalizeVisibleSocketsSettings } from "../../services/settings/visibleSocketSettings.js";
import { SocketVisibilitySettings } from "./SocketVisibilitySettings.js";
import {
  darkFieldInputClassNames,
  modalFieldLabelClassName,
  modalPrimaryButtonClassName,
} from "../Onboarding/fieldClassNames.js";

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const settings = useSettings((state) => state.settings);
  const save = useSettings((state) => state.save);

  const [username, setUsername] = useState("");
  const [visibleSockets, setVisibleSockets] = useState(
    normalizeVisibleSocketsSettings(undefined),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !settings) {
      return;
    }
    setUsername(settings.username);
    setVisibleSockets(
      normalizeVisibleSocketsSettings(settings.visibleSockets),
    );
    setError(null);
    setIsSaving(false);
  }, [isOpen, settings]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, isSaving, onClose]);

  const handleSave = useCallback(async () => {
    if (!settings || !username.trim()) {
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await save({
        ...settings,
        username: username.trim(),
        visibleSockets,
      });
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : String(saveError),
      );
    } finally {
      setIsSaving(false);
    }
  }, [onClose, save, settings, username, visibleSockets]);

  if (!isOpen || !settings) {
    return null;
  }

  const canSave = username.trim().length > 0 && !isSaving;

  return createPortal(
    <dialog
      open
      aria-labelledby="settings-title"
      className="fixed inset-0 z-100 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-4"
    >
      <button
        type="button"
        className="absolute inset-0 bg-wn-mono-950/80 backdrop-blur-sm"
        aria-label="Close dialog"
        disabled={isSaving}
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[min(90vh,40rem)] w-full max-w-lg flex-col gap-6 overflow-hidden rounded-2xl border border-wn-mono-800 bg-wn-mono-900 p-6 text-wn-mono-100 shadow-2xl">
        <header className="flex flex-col gap-1">
          <h2
            id="settings-title"
            className="text-xl font-semibold text-wn-mono-50"
          >
            Settings
          </h2>
          <p className="text-sm text-wn-mono-400">
            Update your profile and view where your worlds are stored.
          </p>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="settings-username"
              className={modalFieldLabelClassName}
            >
              Username <span className="text-wn-red-500">*</span>
            </label>
            <Input
              id="settings-username"
              autoFocus
              isRequired
              aria-label="Username"
              value={username}
              onValueChange={setUsername}
              classNames={darkFieldInputClassNames}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className={modalFieldLabelClassName}>WorldNote folder</span>
            <p className="rounded-xl border border-wn-mono-700 bg-wn-mono-950 px-3 py-2 text-sm text-wn-mono-50">
              {settings.worldnoteRoot}
            </p>
          </div>

          <SocketVisibilitySettings
            value={visibleSockets}
            onChange={setVisibleSockets}
            disabled={isSaving}
          />

          {error ? (
            <p className="text-sm text-wn-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="base"
            isDisabled={isSaving}
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="white"
            size="base"
            className={modalPrimaryButtonClassName}
            isDisabled={!canSave}
            onPress={() => {
              void handleSave();
            }}
          >
            Save
          </Button>
        </footer>
      </div>
    </dialog>,
    document.body,
  );
}
