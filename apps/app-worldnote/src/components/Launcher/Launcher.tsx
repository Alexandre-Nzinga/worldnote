import { revealItemInDir } from "@tauri-apps/plugin-opener";
import {
  Button,
  WorldNoteLogo,
  getBodyTextStyle,
  getHeadingStyle,
  springSnappy,
} from "@worldnote/ui";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { CreateWorldModal } from "../CreateWorldModal.js";
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
import { WorldSettingsModal } from "./WorldSettingsModal.js";
import { VaultModal } from "../Vault/VaultModal.js";

type LauncherProps = {
  onWorldReady: () => void;
  onOpenSettings?: () => void;
};

export function Launcher({ onWorldReady, onOpenSettings }: LauncherProps) {
  const settings = useSettings((state) => state.settings);
  const { openWorld } = useVaultCommands();
  const setCurrentVault = useVault((state) => state.setCurrentVault);

  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [isLoadingWorlds, setIsLoadingWorlds] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [manageWorld, setManageWorld] = useState<WorldSummary | null>(null);
  const [isVaultOpen, setIsVaultOpen] = useState(false);

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
        setCurrentVault(world.path, world.name);
        onWorldReady();
      } catch (error) {
        console.error("Failed to open world:", error);
      } finally {
        setIsBusy(false);
      }
    },
    [onWorldReady, openWorld, setCurrentVault],
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
    <div className="relative flex h-screen flex-col overflow-hidden bg-wn-mono-950 text-wn-mono-100">
      <LauncherHeader
        username={username}
        onOpenSettings={onOpenSettings ?? (() => {})}
      />

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-[46px] pb-8 pt-10">
        <p
          className="mb-2 shrink-0 text-center text-wn-mono-400"
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
          onOpenVault={() => setIsVaultOpen(true)}
          onOpenWorld={(world) => {
            void handleOpenWorld(world);
          }}
          onManageWorld={setManageWorld}
        />
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

      <WorldSettingsModal
        world={manageWorld}
        isOpen={manageWorld !== null}
        onClose={() => setManageWorld(null)}
        onWorldsChanged={() => {
          void refreshWorlds();
        }}
      />

      <VaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        worldnoteRoot={settings?.worldnoteRoot ?? ""}
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
    <header className="relative flex shrink-0 items-center justify-between px-[46px] pt-7">
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
      className="mx-auto mb-10 max-w-[648px] shrink-0 text-center leading-tight text-wn-mono-50"
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
  onOpenVault: () => void;
  onOpenWorld: (world: WorldSummary) => void;
onManageWorld: (world: WorldSummary) => void;
};

function WorldsSection({
  isBusy,
  isLoading,
  worlds,
  onCreate,
  onOpenRoot,
  onOpenVault,
  onOpenWorld,
  onManageWorld,
}: WorldsSectionProps) {
  return (
    <section className="mx-auto flex min-h-0 w-full max-w-[1008px] flex-1 flex-col">
      <div className="mb-6 flex shrink-0 items-center justify-between">
        <h2
          className="text-wn-mono-50"
          style={{
            fontSize: "20px",
            fontWeight: "var(--font-weight-wn-medium)",
          }}
        >
          Your Worlds
        </h2>
        <div className="flex items-center gap-6">
          <Button
            variant="secondary"
            size="sm"
            isDisabled={isBusy}
            onPress={onOpenVault}
            startContent={<i className="ri-stack-line text-base" aria-hidden />}
          >
            Vault
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isDisabled={isBusy}
            onPress={onOpenRoot}
            startContent={
              <i className="ri-folder-open-line text-base" aria-hidden />
            }
          >
            Open folder
          </Button>
          <Button
            variant="white"
            size="sm"
            isDisabled={isBusy}
            onPress={onCreate}
            startContent={<i className="ri-add-line text-base" aria-hidden />}
          >
            Create world
          </Button>
        </div>
      </div>

      <div className="scrollbar-wn flex min-h-0 flex-1 flex-col overflow-y-auto pr-2 pb-6">
        {isLoading ? (
          <div className="flex h-[270px] items-center justify-center rounded-wn-card border border-wn-mono-800 bg-wn-mono-950/20 text-wn-mono-500">
            Loading worlds…
          </div>
        ) : worlds.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {worlds.map((world, index) => (
              <motion.div
                key={world.path}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  ...springSnappy,
                  delay: Math.min(index, 5) * 0.04,
                }}
              >
                <WorldCard
                  world={world}
                  disabled={isBusy}
                  onOpen={onOpenWorld}
                  onManage={onManageWorld}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyWorldsState disabled={isBusy} onCreate={onCreate} />
        )}

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
      </div>
    </section>
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
      <Button variant="white" size="sm" isDisabled={disabled} onPress={onCreate}>
        Create your first world
      </Button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative flex shrink-0 items-center justify-between px-[46px] py-6 text-wn-mono-400">
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
