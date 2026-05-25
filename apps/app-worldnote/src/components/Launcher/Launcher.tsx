import { revealItemInDir } from "@tauri-apps/plugin-opener";
import {
  WorldNoteLogo,
  getBodyTextStyle,
  getHeadingStyle,
} from "@worldnote/ui";
import { useCallback, useEffect, useState } from "react";
import { CreateWorldModal } from "../CreateWorldModal.js";
import { SettingsModal } from "../Settings/SettingsModal.js";
import { ProfileMenu } from "./ProfileMenu.js";
import { useSettings } from "../../hooks/useSettings.js";
import { useVault } from "../../hooks/useVault.js";
import { useVaultCommands } from "../../hooks/useVaultCommands.js";
import {
  listWorlds,
  type WorldSummary,
} from "../../services/worlds/listWorlds.js";
import { getTimeOfDayGreeting } from "./worldCover.js";
import { WorldCard } from "./WorldCard.js";

type LauncherProps = {
  onWorldReady: () => void;
};

export function Launcher({ onWorldReady }: LauncherProps) {
  const settings = useSettings((state) => state.settings);
  const { openWorld } = useVaultCommands();
  const setCurrentVaultPath = useVault((state) => state.setCurrentVaultPath);

  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [isLoadingWorlds, setIsLoadingWorlds] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const refreshWorlds = useCallback(async () => {
    if (!settings?.worldnoteRoot) {
      setWorlds([]);
      setIsLoadingWorlds(false);
      return;
    }
    setIsLoadingWorlds(true);
    try {
      const next = await listWorlds(settings.worldnoteRoot);
      setWorlds(next);
    } catch (error) {
      console.error("Failed to list worlds:", error);
      setWorlds([]);
    } finally {
      setIsLoadingWorlds(false);
    }
  }, [settings?.worldnoteRoot]);

  useEffect(() => {
    void refreshWorlds();
  }, [refreshWorlds]);

  const handleOpenWorld = useCallback(
    async (world: WorldSummary) => {
      setIsBusy(true);
      try {
        await openWorld(world.path);
        setCurrentVaultPath(world.path);
        onWorldReady();
      } catch (error) {
        console.error("Failed to open world:", error);
      } finally {
        setIsBusy(false);
      }
    },
    [onWorldReady, openWorld, setCurrentVaultPath],
  );

  const handleOpenRootFolder = useCallback(async () => {
    if (!settings?.worldnoteRoot) {
      return;
    }
    try {
      await revealItemInDir(settings.worldnoteRoot);
    } catch (error) {
      console.error("Failed to open WorldNote folder:", error);
    }
  }, [settings?.worldnoteRoot]);

  const username = settings?.username ?? "there";
  const greeting = getTimeOfDayGreeting();

  return (
    <div className="relative flex min-h-screen flex-col bg-wn-mono-950 text-wn-mono-100">
      <LauncherHeader
        username={username}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="relative z-10 flex flex-1 flex-col px-[46px] pb-8 pt-10">
        <p
          className="mb-2 text-center text-wn-mono-400"
          style={{
            ...getBodyTextStyle("body"),
            fontSize: "20px",
            fontWeight: "var(--font-weight-wn-medium)",
          }}
        >
          Good {greeting}, {username}
        </p>
        <HeroTitle />

        <WorldsSection
          isBusy={isBusy}
          isLoading={isLoadingWorlds}
          worlds={worlds}
          onCreate={() => setIsCreateOpen(true)}
          onOpenRoot={() => {
            void handleOpenRootFolder();
          }}
          onOpenWorld={(world) => {
            void handleOpenWorld(world);
          }}
        />

        <p
          className="mx-auto mt-10 max-w-[570px] text-center text-wn-mono-400"
          style={{
            ...getBodyTextStyle("body"),
            fontSize: "14px",
            fontWeight: "var(--font-weight-wn-medium)",
          }}
        >
          Each world is a folder on your machine with a{" "}
          <code className="rounded bg-wn-mono-900 px-1 py-0.5 text-wn-mono-300">
            .worldnote
          </code>{" "}
          config and a{" "}
          <code className="rounded bg-wn-mono-900 px-1 py-0.5 text-wn-mono-300">
            lore/
          </code>{" "}
          JSON store. Nothing leaves your computer.
        </p>
      </main>

      <Footer />

      <CreateWorldModal
        isOpen={isCreateOpen}
        forcedRoot={settings?.worldnoteRoot}
        onClose={() => setIsCreateOpen(false)}
        onWorldReady={() => {
          void refreshWorlds();
          onWorldReady();
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

function LauncherHeader({
  username,
  onOpenSettings,
}: {
  username: string;
  onOpenSettings: () => void;
}) {
  return (
    <header className="relative z-10 flex items-center justify-between px-[46px] pt-7">
      <div className="flex items-center gap-3">
        <WorldNoteLogo
          variant="icon"
          tone="white"
          className="h-7 w-7 opacity-90"
          alt="WorldNote"
        />
        <span
          className="text-wn-mono-50"
          style={{
            ...getBodyTextStyle("small"),
            fontSize: "24px",
            fontWeight: "var(--font-weight-wn-semibold)",
          }}
        >
          WorldNote
        </span>
      </div>
      <ProfileMenu username={username} onOpenSettings={onOpenSettings} />
    </header>
  );
}

function HeroTitle() {
  return (
    <h1
      className="mx-auto mb-16 max-w-[648px] text-center leading-tight text-wn-mono-50"
      style={{
        ...getHeadingStyle("h1"),
        fontSize: "48px",
        fontWeight: "var(--font-weight-wn-semibold)",
        color: "var(--color-wn-mono-50)",
      }}
    >
      What are you building today?
    </h1>
  );
}

type WorldsSectionProps = {
  isBusy: boolean;
  isLoading: boolean;
  worlds: WorldSummary[];
  onCreate: () => void;
  onOpenRoot: () => void;
  onOpenWorld: (world: WorldSummary) => void;
};

function WorldsSection({
  isBusy,
  isLoading,
  worlds,
  onCreate,
  onOpenRoot,
  onOpenWorld,
}: WorldsSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[1008px]">
      <div className="mb-6 flex items-center justify-between">
        <h2
          className="text-wn-mono-50"
          style={{
            fontSize: "20px",
            fontWeight: "var(--font-weight-wn-medium)",
          }}
        >
          Your Worlds
        </h2>
        <div className="flex items-center gap-8">
          <HeaderAction
            disabled={isBusy}
            iconClass="ri-folder-open-line"
            label="Open folder"
            onClick={onOpenRoot}
          />
          <HeaderAction
            disabled={isBusy}
            iconClass="ri-add-line"
            label="Create world"
            onClick={onCreate}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[270px] items-center justify-center rounded-wn-card border border-wn-mono-800 bg-wn-mono-950/20 text-wn-mono-500">
          Loading worlds…
        </div>
      ) : worlds.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {worlds.map((world) => (
            <WorldCard
              key={world.path}
              world={world}
              disabled={isBusy}
              onOpen={onOpenWorld}
            />
          ))}
        </div>
      ) : (
        <EmptyWorldsState disabled={isBusy} onCreate={onCreate} />
      )}
    </section>
  );
}

type HeaderActionProps = {
  iconClass: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

function HeaderAction({ iconClass, label, onClick, disabled }: HeaderActionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-2 text-wn-mono-50 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        fontSize: "20px",
        fontWeight: "var(--font-weight-wn-medium)",
      }}
    >
      <i className={`${iconClass} text-[18px] leading-none`} aria-hidden />
      {label}
    </button>
  );
}

type EmptyWorldsStateProps = {
  onCreate: () => void;
  disabled?: boolean;
};

function EmptyWorldsState({ onCreate, disabled }: EmptyWorldsStateProps) {
  return (
    <div
      className="flex h-[270px] flex-col items-center justify-center gap-4 rounded-wn-card border border-dashed border-wn-mono-800 bg-wn-mono-950/20"
      style={{ borderRadius: "var(--radius-wn-card)" }}
    >
      <p
        className="text-wn-mono-400"
        style={{
          fontSize: "20px",
          fontWeight: "var(--font-weight-wn-medium)",
        }}
      >
        No worlds yet
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={onCreate}
        className="text-wn-mono-50 underline-offset-4 transition-opacity hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          fontSize: "16px",
          fontWeight: "var(--font-weight-wn-medium)",
        }}
      >
        Create your first world
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 flex items-center justify-between px-[46px] py-6 text-wn-mono-400">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-[5px] w-[5px] rounded-full"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--color-wn-lime-500) 80%, transparent)",
          }}
        />
        <span
          style={{ fontSize: "14px", fontWeight: "var(--font-weight-wn-medium)" }}
        >
          online
        </span>
      </div>
      <div
        className="flex items-center gap-2"
        style={{ fontSize: "14px", fontWeight: "var(--font-weight-wn-medium)" }}
      >
        <span>WorldNote</span>
        <span className="font-mono">v{__APP_VERSION__}</span>
      </div>
    </footer>
  );
}
