import { Input } from "@heroui/react";
import { Button, WorldNoteLogo, getBodyTextStyle } from "@worldnote/ui";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useSettings } from "../../hooks/useSettings.js";
import { normalizeVisibleSocketsSettings } from "../../services/settings/visibleSocketSettings.js";
import { SocketVisibilitySettings } from "./SocketVisibilitySettings.js";
import {
  darkFieldInputClassNames,
  modalFieldLabelClassName,
  modalPrimaryButtonClassName,
} from "../Onboarding/fieldClassNames.js";

type SettingsProps = {
  onBack: () => void;
};

export function Settings({ onBack }: SettingsProps) {
  const settings = useSettings((state) => state.settings);
  const save = useSettings((state) => state.save);

  const [username, setUsername] = useState("");
  const [visibleSockets, setVisibleSockets] = useState(
    normalizeVisibleSocketsSettings(undefined),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) {
      return;
    }
    setUsername(settings.username);
    setVisibleSockets(
      normalizeVisibleSocketsSettings(settings.visibleSockets),
    );
    setError(null);
    setIsSaving(false);
  }, [settings]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        onBack();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isSaving, onBack]);

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
      onBack();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : String(saveError),
      );
    } finally {
      setIsSaving(false);
    }
  }, [onBack, save, settings, username, visibleSockets]);

  const canSave = username.trim().length > 0 && !isSaving;

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wn-mono-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <WorldNoteLogo
            variant="icon"
            tone="white"
            className="h-12 w-12 opacity-60"
            alt="Loading"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-wn-mono-950 text-wn-mono-100">
      <header className="relative flex shrink-0 items-center justify-between px-[46px] pt-7">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={onBack}
            aria-label="Back to launcher"
            className="text-wn-mono-400 hover:text-wn-mono-50"
          >
            <i className="ri-arrow-left-line text-lg" aria-hidden />
          </Button>
          <div className="flex items-center gap-3">
            <span
              className="text-wn-mono-50"
              style={{
                ...getBodyTextStyle("small"),
                fontSize: "24px",
                fontWeight: "var(--font-weight-wn-semibold)",
              }}
            >
              Settings
            </span>
          </div>
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-[46px] pb-8 pt-10">
        <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-wn-mono-50">
                Profile Settings
              </h1>
              <p className="text-sm text-wn-mono-400">
                Update your profile and manage your canvas preferences.
              </p>
            </div>

            <div className="flex flex-col gap-6">
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
                <span className={modalFieldLabelClassName}>
                  WorldNote folder
                </span>
                <p className="rounded-xl border border-wn-mono-700 bg-wn-mono-950 px-3 py-2 text-sm text-wn-mono-50">
                  {settings.worldnoteRoot}
                </p>
              </div>

              <div className="border-t border-wn-mono-800 pt-6">
                <SocketVisibilitySettings
                  value={visibleSockets}
                  onChange={setVisibleSockets}
                  disabled={isSaving}
                />
              </div>

              {error ? (
                <p className="text-sm text-wn-red-400" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-wn-mono-800 pt-6">
          <Button
            variant="secondary"
            size="base"
            isDisabled={isSaving}
            onPress={onBack}
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
      </main>
    </div>
  );
}
