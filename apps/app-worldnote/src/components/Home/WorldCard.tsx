import { MaterialSymbol, MotionPressable, Pill, WorldNoteLogo } from "@worldnote/ui";
import type { WorldSummary } from "../../services/worlds/listWorlds.js";
import {
  formatRelativeTime,
  worldCoverImageSrc,
  worldCoverStyle,
} from "./worldCover.js";

type WorldCardProps = {
  world: WorldSummary;
  disabled?: boolean;
  isPinned?: boolean;
  canPin?: boolean;
  onTogglePin?: (world: WorldSummary) => void;
  onOpen: (world: WorldSummary) => void;
  onManage?: (world: WorldSummary) => void;
};

const cardClassName = [
  "group relative mx-auto flex w-full max-w-[360px] flex-col overflow-hidden text-left",
  "rounded-wn-card border border-black/10 dark:border-white/10",
  "bg-linear-to-b from-black/[0.04] to-black/[0.01] dark:from-white/[0.07] dark:to-white/[0.02]",
  "shadow-[0_24px_48px_-24px_rgba(0,0,0,0.35)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_24px_48px_-24px_rgba(0,0,0,0.7)]",
  "backdrop-blur-2xl",
  "transition-colors duration-200",
  "hover:from-black/[0.06] hover:to-black/[0.02] hover:border-black/15",
  "dark:hover:from-white/[0.1] dark:hover:to-white/[0.04] dark:hover:border-white/15",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

const pillClassName = [
  "bg-wn-mono-700",
  "shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]",
  "w-20 justify-center tabular-nums",
].join(" ");

/** Home world card — iOS "liquid glass" surface with hashed cover. */
export function WorldCard({
  world,
  disabled,
  isPinned = false,
  canPin = true,
  onTogglePin,
  onOpen,
  onManage,
}: WorldCardProps) {
  const coverSrc = worldCoverImageSrc(world.path, world.coverImage);
  const showPin = onTogglePin != null;
  const pinDisabled = disabled || (!isPinned && !canPin);

  const shellClassName = [
    cardClassName,
    isPinned &&
      "border-black/30 ring-1 ring-black/15 dark:border-white/35 dark:ring-white/20",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClassName} style={{ borderRadius: "var(--radius-wn-card)" }}>
      {showPin ? (
        <button
          type="button"
          disabled={pinDisabled}
          title={
            isPinned ? "Unpin from home" : canPin ? "Pin to home" : "Pin limit reached (3)"
          }
          aria-label={
            isPinned ? `Unpin ${world.name}` : `Pin ${world.name} to home`
          }
          aria-pressed={isPinned}
          className={[
            "absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-black/15 bg-wn-mono-950/70 text-wn-mono-100 backdrop-blur-md transition-colors dark:border-white/20",
            "hover:border-black/30 hover:bg-wn-mono-900/90 hover:text-wn-mono-50 dark:hover:border-white/35",
            "disabled:cursor-not-allowed disabled:opacity-40",
            isPinned &&
              "border-black/30 bg-black/5 text-wn-text dark:border-white/35 dark:bg-white/10 dark:text-wn-mono-50",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={(event) => {
            event.stopPropagation();
            if (!pinDisabled) {
              onTogglePin(world);
            }
          }}
        >
          <MaterialSymbol
            name="keep"
            filled={isPinned}
            className="text-base leading-none"
          />
        </button>
      ) : null}
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
        className="flex w-full flex-col text-left"
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
            className="absolute inset-0 bg-linear-to-b from-white/10 via-transparent to-black/40"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_0_0_1px_rgba(0,0,0,0.3)_inset]"
          />
          <WorldNoteLogo
            variant="icon"
            tone="white"
            className="absolute left-3 top-3 h-5 w-5 opacity-60"
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
          {formatRelativeTime(world.lastEdited)}
        </span>
      </div>
      </MotionPressable>
    </div>
  );
}
