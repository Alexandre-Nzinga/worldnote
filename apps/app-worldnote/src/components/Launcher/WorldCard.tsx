import { WorldNoteLogo } from "@worldnote/ui";
import type { WorldSummary } from "../../services/worlds/listWorlds.js";
import { formatRelativeTime, worldCoverStyle } from "./worldCover.js";

type WorldCardProps = {
  world: WorldSummary;
  disabled?: boolean;
  onOpen: (world: WorldSummary) => void;
};

export function WorldCard({ world, disabled, onOpen }: WorldCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onOpen(world)}
      className="flex w-full flex-col overflow-hidden rounded-wn-card border border-wn-mono-800 bg-wn-mono-900 text-left transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      style={{ borderRadius: "var(--radius-wn-card)" }}
    >
      <div
        className="relative flex h-[140px] items-center justify-center"
        style={worldCoverStyle(world.name)}
      >
        <span className="px-4 text-center text-lg font-semibold text-wn-mono-50">
          {world.name}
        </span>
        <WorldNoteLogo
          variant="icon"
          tone="white"
          className="absolute right-3 top-3 h-5 w-5 opacity-40"
          alt=""
        />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-wn-mono-800 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate font-semibold text-wn-mono-50">{world.name}</div>
          <span className="mt-1 inline-block rounded-full border border-wn-mono-700 bg-wn-mono-950 px-2 py-0.5 text-[11px] text-wn-mono-400">
            {world.cardCount} card{world.cardCount === 1 ? "" : "s"}
          </span>
        </div>
        <span className="shrink-0 text-xs text-wn-mono-500">
          {formatRelativeTime(world.lastOpened)}
        </span>
      </div>
    </button>
  );
}
