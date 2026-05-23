import { open } from "@tauri-apps/plugin-dialog";
import {
  Button,
  WorldNoteLogo,
  getBodyTextStyle,
  getHeadingStyle,
} from "@worldnote/ui";
import { useCallback, useState } from "react";
import { useVault } from "../hooks/useVault.js";
import { useVaultCommands } from "../hooks/useVaultCommands.js";

type Props = {
  onWorldReady: () => void;
};

export function Home({ onWorldReady }: Props) {
  const { createWorld, openWorld } = useVaultCommands();
  const setCurrentVaultPath = useVault((state) => state.setCurrentVaultPath);
  const [isBusy, setIsBusy] = useState(false);

  const pickFolder = useCallback(async () => {
    const selection = await open({
      directory: true,
      multiple: false,
      title: "Choose a world folder",
    });
    if (!selection || Array.isArray(selection)) {
      return null;
    }
    return selection;
  }, []);

  const handleCreateWorld = useCallback(async () => {
    const root = await pickFolder();
    if (!root) {
      return;
    }
    setIsBusy(true);
    try {
      await createWorld(root);
      setCurrentVaultPath(root);
      onWorldReady();
    } finally {
      setIsBusy(false);
    }
  }, [createWorld, onWorldReady, pickFolder, setCurrentVaultPath]);

  const handleOpenWorld = useCallback(async () => {
    const root = await pickFolder();
    if (!root) {
      return;
    }
    setIsBusy(true);
    try {
      await openWorld(root);
      setCurrentVaultPath(root);
      onWorldReady();
    } finally {
      setIsBusy(false);
    }
  }, [onWorldReady, openWorld, pickFolder, setCurrentVaultPath]);

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        backgroundColor: "var(--color-wn-mono-800)",
        color: "var(--color-wn-mono-100)",
      }}
    >
      <header className="relative z-10 flex items-center gap-3 px-8 pt-7">
        <WorldNoteLogo
          variant="icon"
          tone="white"
          className="h-7 w-7 opacity-90"
        />
        <span
          className="tracking-wide text-wn-mono-200"
          style={{ ...getBodyTextStyle("small"), fontWeight: 600 }}
        >
          WorldNote
        </span>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-8">
        <div className="flex w-full max-w-xl flex-col items-center gap-12 text-center">
          <div className="flex flex-col items-center gap-6">
            <WorldNoteLogo
              variant="icon"
              tone="white"
              className="h-16 w-16 drop-shadow-[0_8px_24px_rgba(99,102,241,0.25)]"
            />
            <div className="flex flex-col items-center gap-3">
              <h1
                className="leading-[1.05]"
                style={{
                  ...getHeadingStyle("h1"),
                  color: "var(--color-wn-mono-50)",
                }}
              >
                WorldNote
              </h1>
              <p
                className="max-w-md"
                style={{
                  ...getBodyTextStyle("body"),
                  color: "var(--color-wn-mono-400)",
                }}
              >
                A local-first worldbuilding engine
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-xs flex-col items-stretch gap-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full border border-wn-mono-500 bg-wn-indigo-700 px-6 py-3 text-wn-mono-50 shadow-[0_8px_24px_rgba(67,56,202,0.4)] hover:border-white hover:bg-white hover:!text-wn-mono-900 data-[hover=true]:border-white data-[hover=true]:bg-white data-[hover=true]:!text-wn-mono-900 data-[pressed=true]:!text-wn-mono-900"
              onPress={() => {
                void handleCreateWorld();
              }}
              isDisabled={isBusy}
            >
              Create world
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full border border-wn-mono-500 bg-wn-mono-800 px-6 py-3 text-wn-mono-100 hover:border-white hover:bg-white hover:!text-wn-mono-900 data-[hover=true]:border-white data-[hover=true]:bg-white data-[hover=true]:!text-wn-mono-900 data-[pressed=true]:!text-wn-mono-900"
              isDisabled={isBusy}
              onPress={() => {
                void handleOpenWorld();
              }}
            >
              Open existing world
            </Button>
          </div>

          <p
            className="max-w-sm"
            style={{
              ...getBodyTextStyle("xs"),
              color: "var(--color-wn-mono-500)",
            }}
          >
            Each world is a folder on your machine with a{" "}
            <code
              className="rounded px-1 py-0.5"
              style={{
                backgroundColor: "var(--color-wn-mono-800)",
                color: "var(--color-wn-mono-300)",
              }}
            >
              .worldnote
            </code>{" "}
            config and a{" "}
            <code
              className="rounded px-1 py-0.5"
              style={{
                backgroundColor: "var(--color-wn-mono-800)",
                color: "var(--color-wn-mono-300)",
              }}
            >
              lore/
            </code>{" "}
            JSON store. Nothing leaves your computer.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer
      className="relative z-10 flex items-center justify-between px-8 py-3"
      style={{
        ...getBodyTextStyle("xs"),
        borderTop: "1px solid var(--color-wn-mono-700)",
        backgroundColor: "var(--color-wn-mono-800)",
      }}
    >
      <div
        className="flex items-center gap-2"
        style={{ color: "var(--color-wn-mono-500)" }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--color-wn-lime-500) 80%, transparent)",
          }}
        />
        <span>Local-first</span>
      </div>
      <div
        className="flex items-center gap-3"
        style={{ color: "var(--color-wn-mono-500)" }}
      >
        <span style={{ color: "var(--color-wn-mono-600)" }}>WorldNote</span>
        <span
          className="font-mono"
          style={{ color: "var(--color-wn-mono-400)" }}
        >
          v{__APP_VERSION__}
        </span>
      </div>
    </footer>
  );
}
