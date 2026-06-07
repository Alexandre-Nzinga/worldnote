import {
  ActionMenu,
  Button,
  getHeadingProps,
  MaterialSymbol,
} from "@worldnote/ui";
import { useMemo } from "react";
import { MAX_PINNED_WORLDS } from "../../services/settings/pinnedWorlds.js";
import type { StarterPack } from "../../services/starterPacks/index.js";
import type { WorldSummary } from "../../services/worlds/listWorlds.js";
import { EmptyWorldsState } from "./EmptyWorldsState.js";
import { HomeFooter } from "./HomeFooter.js";
import { StarterPacksSection } from "./StarterPacksSection.js";
import { WorldCardSkeletonGrid } from "./WorldCardSkeleton.js";
import { WorldsGrid } from "./WorldsGrid.js";

type WorldsSectionProps = {
  isBusy: boolean;
  isLoading: boolean;
  worlds: WorldSummary[];
  pinnedCount: number;
  pinnedPaths: string[];
  onCreate: () => void;
  onImportWorld: () => void;
  onTrySampleWorld: () => void;
  onOpenRoot: () => void;
  onOpenVault: () => void;
  onOpenWorld: (world: WorldSummary) => void;
  onManageWorld: (world: WorldSummary) => void;
  onTogglePin: (world: WorldSummary) => void;
  onStartStarterPack: (pack: StarterPack) => void;
};

export function WorldsSection({
  isBusy,
  isLoading,
  worlds,
  pinnedCount,
  pinnedPaths,
  onCreate,
  onImportWorld,
  onTrySampleWorld,
  onOpenRoot,
  onOpenVault,
  onOpenWorld,
  onManageWorld,
  onTogglePin,
  onStartStarterPack,
}: WorldsSectionProps) {
  const pinnedSet = useMemo(() => new Set(pinnedPaths), [pinnedPaths]);
  const canPinMore = pinnedCount < MAX_PINNED_WORLDS;

  return (
    <section className="mx-auto flex min-h-0 w-full max-w-[1008px] flex-1 flex-col">
      <div className="mb-6 flex shrink-0 items-center justify-between">
        <h2 {...getHeadingProps("h4", { tone: "inverse" })}>Your Worlds</h2>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            isDisabled={isBusy}
            onPress={onOpenVault}
            startContent={<MaterialSymbol name="layers" className="text-base" />}
          >
            Vault
          </Button>
          <Button
            variant="white"
            size="sm"
            isDisabled={isBusy}
            onPress={onCreate}
            startContent={<MaterialSymbol name="add" className="text-base" />}
          >
            Create world
          </Button>
          <ActionMenu
            ariaLabel="More world actions"
            placement="bottom-end"
            onAction={(key) => {
              if (key === "import") {
                onImportWorld();
                return;
              }
              if (key === "open-folder") {
                onOpenRoot();
              }
            }}
            items={[
              {
                id: "import",
                label: "Import world",
                icon: (
                  <MaterialSymbol name="download" className="text-[20px]" />
                ),
              },
              {
                id: "open-folder",
                label: "Open folder",
                icon: (
                  <MaterialSymbol name="folder_open" className="text-[20px]" />
                ),
              },
            ]}
            trigger={
              <Button
                variant="secondary"
                size="sm"
                isIconOnly
                isDisabled={isBusy}
                aria-label="More world actions"
                className="min-w-9 px-0"
              >
                <MaterialSymbol name="more_vert" className="text-lg" />
              </Button>
            }
          />
        </div>
      </div>

      <div className="scrollbar-wn flex min-h-0 flex-1 flex-col overflow-y-auto pr-2">
        {isLoading ? (
          <WorldCardSkeletonGrid />
        ) : worlds.length > 0 ? (
          <WorldsGrid
            worlds={worlds}
            pinnedCount={pinnedCount}
            pinnedSet={pinnedSet}
            canPinMore={canPinMore}
            isBusy={isBusy}
            onOpenWorld={onOpenWorld}
            onManageWorld={onManageWorld}
            onTogglePin={onTogglePin}
          />
        ) : (
          <EmptyWorldsState
            disabled={isBusy}
            onTrySampleWorld={onTrySampleWorld}
          />
        )}

        <StarterPacksSection
          isBusy={isBusy}
          onStartPack={onStartStarterPack}
        />

        <HomeFooter />
      </div>
    </section>
  );
}
