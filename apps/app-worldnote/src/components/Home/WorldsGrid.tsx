import { springSnappy } from "@worldnote/ui";
import { motion } from "framer-motion";
import type { WorldSummary } from "../../services/worlds/listWorlds.js";
import { WorldCard } from "./WorldCard.js";

type WorldsGridProps = {
  worlds: WorldSummary[];
  pinnedCount: number;
  pinnedSet: Set<string>;
  canPinMore: boolean;
  isBusy: boolean;
  onOpenWorld: (world: WorldSummary) => void;
  onManageWorld: (world: WorldSummary) => void;
  onTogglePin: (world: WorldSummary) => void;
};

const sectionLabelStyle = {
  fontSize: "14px",
  fontWeight: "var(--font-weight-wn-medium)",
} as const;

export function WorldsGrid({
  worlds,
  pinnedCount,
  pinnedSet,
  canPinMore,
  isBusy,
  onOpenWorld,
  onManageWorld,
  onTogglePin,
}: WorldsGridProps) {
  const pinned = worlds.slice(0, pinnedCount);
  const unpinned = worlds.slice(pinnedCount);

  const renderCard = (world: WorldSummary, index: number) => (
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
        isPinned={pinnedSet.has(world.path)}
        canPin={canPinMore || pinnedSet.has(world.path)}
        onTogglePin={onTogglePin}
        onOpen={onOpenWorld}
        onManage={onManageWorld}
      />
    </motion.div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pinnedCount > 0 ? (
        <>
          <p
            className="col-span-full text-wn-mono-400"
            style={sectionLabelStyle}
          >
            Pinned
          </p>
          {pinned.map((world, index) => renderCard(world, index))}
        </>
      ) : null}
      {unpinned.length > 0 && pinnedCount > 0 ? (
        <p
          className="col-span-full mt-2 text-wn-mono-400"
          style={sectionLabelStyle}
        >
          All worlds
        </p>
      ) : null}
      {unpinned.map((world, index) => renderCard(world, pinnedCount + index))}
    </div>
  );
}
