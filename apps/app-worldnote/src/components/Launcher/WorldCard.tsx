import { MotionPressable, Pill, WorldNoteLogo } from "@worldnote/ui";
import type { WorldSummary } from "../../services/worlds/listWorlds.js";
import {
  formatRelativeTime,
  worldCoverImageSrc,
  worldCoverStyle,
} from "./worldCover.js";

type WorldCardProps = {
  world: WorldSummary;
  disabled?: boolean;
  onOpen: (world: WorldSummary) => void;
  onManage?: (world: WorldSummary) => void;
};

const cardClassName = [
  "group relative flex w-full max-w-[360px] mx-auto flex-col overflow-hidden text-left",
  "rounded-wn-card border border-white/10",
  "bg-gradient-to-b from-white/[0.07] to-white/[0.02]",
  "shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_24px_48px_-24px_rgba(0,0,0,0.7)]",
  "backdrop-blur-2xl",
  "transition-colors duration-200",
  "hover:from-white/[0.1] hover:to-white/[0.04] hover:border-white/15",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

const pillClassName = ["bg-wn-mono-700", "shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"].join(
  " ",
);

/** Launcher world card — iOS "liquid glass" surface with hashed cover. */
export function WorldCard({ world, disabled, onOpen, onManage }: WorldCardProps) {
  const coverSrc = worldCoverImageSrc(world.path, world.coverImage);

  return (
    <MotionPressable
      disabled={disabled}
      enableHover
      onClick={() => onOpen(world)}
      onContextMenu={(event) => {
        event.preventDefault();
        if (!disabled) {
          onManage?.(world);
        }
      }}
      className={cardClassName}
      style={{ borderRadius: "var(--radius-wn-card)" }}
    >
      <div className="p-2.5">
        <div
          className="relative h-[160px] overflow-hidden rounded-2xl bg-wn-mono-900"
          style={coverSrc ? undefined : worldCoverStyle(world.name)}
        >
          {coverSrc ? (
            <img
              src={coverSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/40"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_0_0_1px_rgba(0,0,0,0.3)_inset]"
          />
          <WorldNoteLogo
            variant="icon"
            tone="white"
            className="absolute right-3 top-3 h-5 w-5 opacity-60"
            alt=""
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-1">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="truncate text-base font-semibold text-wn-mono-50">
            {world.name}
          </div>
          <Pill size="sm" className={pillClassName} textClassName="text-wn-mono-50">
            {world.cardCount} card{world.cardCount === 1 ? "" : "s"}
          </Pill>
        </div>
        <span className="shrink-0 text-xs text-wn-mono-400">
          {formatRelativeTime(world.lastOpened)}
        </span>
      </div>
    </MotionPressable>
  );
}
