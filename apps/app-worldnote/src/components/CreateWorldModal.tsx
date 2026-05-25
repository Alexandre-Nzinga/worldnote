import { Input, Textarea } from "@heroui/react";
import { Button } from "@worldnote/ui";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useVault } from "../hooks/useVault.js";
import { useVaultCommands } from "../hooks/useVaultCommands.js";
import { pickDirectory } from "../services/desktop/pickDirectory.js";
import {
  darkFieldInputClassNames,
  modalFieldLabelClassName,
  modalPrimaryButtonClassName,
} from "./Onboarding/fieldClassNames.js";

type CreateWorldModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onWorldReady: () => void;
  /** When set, worlds are created under this root (e.g. managed WorldNote folder). */
  forcedRoot?: string;
};

export function CreateWorldModal({
  isOpen,
  onClose,
  onWorldReady,
  forcedRoot,
}: CreateWorldModalProps) {
  const { createWorld } = useVaultCommands();
  const setCurrentVaultPath = useVault((state) => state.setCurrentVaultPath);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveRoot = forcedRoot ?? location;
  const canSubmit = name.trim().length > 0 && !!effectiveRoot && !isSubmitting;

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setLocation(null);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  const handleBrowse = useCallback(async () => {
    try {
      const selection = await pickDirectory("Choose where to store the world");
      if (!selection) {
        return;
      }
      setLocation(selection);
      setError(null);
    } catch (browseError) {
      setError(
        browseError instanceof Error
          ? browseError.message
          : "Could not open the folder picker.",
      );
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!effectiveRoot || !name.trim()) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const worldPath = await createWorld({
        root: effectiveRoot,
        name: name.trim(),
        description: description.trim(),
      });
      setCurrentVaultPath(worldPath);
      onWorldReady();
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : String(submitError),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    createWorld,
    description,
    effectiveRoot,
    name,
    onClose,
    onWorldReady,
    setCurrentVaultPath,
  ]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <dialog
      open
      aria-labelledby="create-world-title"
      className="fixed inset-0 z-100 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-4"
    >
      <button
        type="button"
        className="absolute inset-0 bg-wn-mono-950/80 backdrop-blur-sm"
        aria-label="Close dialog"
        disabled={isSubmitting}
        onClick={onClose}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col gap-6 rounded-2xl border border-wn-mono-800 bg-wn-mono-900 p-6 text-wn-mono-100 shadow-2xl">
        <header className="flex flex-col gap-1">
          <h2
            id="create-world-title"
            className="text-xl font-semibold text-wn-mono-50"
          >
            Create new world
          </h2>
          <p className="text-sm text-wn-mono-400">
            Name your world, add an optional description, and choose where to
            store it on your machine.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="create-world-name"
              className={modalFieldLabelClassName}
            >
              Name <span className="text-wn-red-500">*</span>
            </label>
            <Input
              id="create-world-name"
              autoFocus
              isRequired
              aria-label="Name"
              placeholder="Lost Suns"
              value={name}
              onValueChange={setName}
              classNames={darkFieldInputClassNames}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="create-world-description"
              className={modalFieldLabelClassName}
            >
              Description
            </label>
            <Textarea
              id="create-world-description"
              aria-label="Description"
              placeholder="A short summary of your world (optional)"
              minRows={3}
              value={description}
              onValueChange={setDescription}
              classNames={darkFieldInputClassNames}
            />
          </div>

          {!forcedRoot ? (
            <div className="flex flex-col gap-1">
              <span className={modalFieldLabelClassName}>
                Location <span className="text-wn-red-500">*</span>
              </span>
              <div className="flex gap-2">
                <Input
                  isReadOnly
                  aria-label="Location"
                  placeholder="Browse for a folder…"
                  value={location ?? ""}
                  classNames={{
                    ...darkFieldInputClassNames,
                    base: "flex-1",
                  }}
                />
                <Button
                  variant="secondary"
                  size="base"
                  onPress={() => {
                    void handleBrowse();
                  }}
                >
                  Browse
                </Button>
              </div>
            </div>
          ) : null}

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
            isDisabled={isSubmitting}
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="white"
            size="base"
            className={modalPrimaryButtonClassName}
            isDisabled={!canSubmit}
            onPress={() => {
              void handleSubmit();
            }}
          >
            Create world
          </Button>
        </footer>
      </div>
    </dialog>,
    document.body,
  );
}
