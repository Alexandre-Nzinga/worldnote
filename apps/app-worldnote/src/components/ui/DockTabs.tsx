import { MaterialSymbol, usePrefersReducedMotion } from "@worldnote/ui";
import { primaryAccentRingOnDarkClassName } from "../../services/settings/primaryAccentStyles.js";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, useState, type ReactNode, type RefObject } from "react";

export type DockTabItem = {
  id: string;
  name: string;
  icon?: string;
  iconNode?: ReactNode;
  colorClassName: string;
  iconClassName?: string;
  isActive?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

type DockOrientation = "horizontal" | "vertical";

type DockIconProps = {
  item: DockTabItem;
  mousePosition: MotionValue<number>;
  orientation: DockOrientation;
  itemRef?: RefObject<HTMLDivElement | null>;
};

function DockIcon({ item, mousePosition, orientation, itemRef }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const distance = useTransform(mousePosition, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
    if (orientation === "vertical") {
      return val - bounds.y - bounds.height / 2;
    }
    return val - bounds.x - bounds.width / 2;
  });

  const baseSize = reducedMotion ? 48 : 44;
  const peakSize = reducedMotion ? 48 : 64;

  const widthSync = useTransform(
    distance,
    [-120, 0, 120],
    [baseSize, peakSize, baseSize],
  );
  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const heightSync = useTransform(
    distance,
    [-120, 0, 120],
    [baseSize, peakSize, baseSize],
  );
  const height = useSpring(heightSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const setRefs = (node: HTMLDivElement | null) => {
    ref.current = node;
    if (itemRef && "current" in itemRef) {
      itemRef.current = node;
    }
  };

  return (
    <motion.div
      ref={setRefs}
      style={reducedMotion ? { width: baseSize, height: baseSize } : { width, height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => !item.disabled && setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      className="relative flex aspect-square cursor-pointer items-center justify-center"
      whileTap={item.disabled ? undefined : { scale: 0.95 }}
    >
      <motion.button
        type="button"
        aria-label={item.name}
        aria-pressed={item.isActive}
        disabled={item.disabled}
        onClick={item.onPress}
        className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl shadow-lg disabled:cursor-not-allowed disabled:opacity-40 ${item.colorClassName} ${
          item.isActive ? primaryAccentRingOnDarkClassName : ""
        }`}
        animate={
          orientation === "vertical"
            ? {
                x: isClicked ? -2 : isHovered && !item.disabled ? -6 : 0,
              }
            : {
                y: isClicked ? 2 : isHovered && !item.disabled ? -6 : 0,
              }
        }
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
      >
        <motion.span
          className="flex items-center justify-center"
          animate={{
            scale: isHovered && !item.disabled ? 1.08 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17,
          }}
        >
          {item.iconNode ? (
            <span className="flex items-center justify-center">{item.iconNode}</span>
          ) : (
            <MaterialSymbol
              name={item.icon ?? "help"}
              className={`text-xl ${item.iconClassName ?? ""}`}
            />
          )}
        </motion.span>

        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-wn-mono-50/20 to-transparent"
          animate={{
            opacity: isHovered && !item.disabled ? 0.35 : 0.12,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>

      <motion.span
        aria-hidden
        initial={
          orientation === "vertical"
            ? { opacity: 0, x: -10, scale: 0.8 }
            : { opacity: 0, y: 10, scale: 0.8 }
        }
        animate={
          orientation === "vertical"
            ? {
                opacity: isHovered && !item.disabled ? 1 : 0,
                x: isHovered && !item.disabled ? 0 : -10,
                scale: isHovered && !item.disabled ? 1 : 0.8,
              }
            : {
                opacity: isHovered && !item.disabled ? 1 : 0,
                y: isHovered && !item.disabled ? -18 : 10,
                scale: isHovered && !item.disabled ? 1 : 0.8,
              }
        }
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={
          orientation === "vertical"
            ? "pointer-events-none absolute left-full top-1/2 z-10 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-wn-mono-700 bg-wn-mono-950/90 px-2 py-1 text-xs font-semibold text-wn-mono-100 backdrop-blur-sm"
            : "pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-wn-mono-700 bg-wn-mono-950/90 px-2 py-1 text-xs font-semibold text-wn-mono-100 backdrop-blur-sm"
        }
      >
        {item.name}
      </motion.span>
    </motion.div>
  );
}

type DockTabsProps = {
  items: DockTabItem[];
  className?: string;
  orientation?: DockOrientation;
  itemRefs?: Partial<Record<string, RefObject<HTMLDivElement | null>>>;
  leading?: ReactNode;
  trailing?: ReactNode;
};

const dockShellClassName =
  "rounded-3xl border border-wn-mono-700/80 bg-wn-mono-900/85 shadow-xl backdrop-blur-md";

export function DockTabs({
  items,
  className,
  orientation = "horizontal",
  itemRefs,
  leading,
  trailing,
}: DockTabsProps) {
  const mousePosition = useMotionValue(Number.POSITIVE_INFINITY);
  const isVertical = orientation === "vertical";

  return (
    <motion.div
      onMouseMove={(event) =>
        mousePosition.set(isVertical ? event.pageY : event.pageX)
      }
      onMouseLeave={() => mousePosition.set(Number.POSITIVE_INFINITY)}
      className={
        isVertical
          ? `flex w-18 flex-col items-end gap-3 py-3 pl-2 pr-3 ${dockShellClassName} ${className ?? ""}`
          : `mx-auto flex h-18 items-end gap-3 px-3 pb-3 pt-2 ${dockShellClassName} ${className ?? ""}`
      }
      initial={isVertical ? { x: -24, opacity: 0 } : { y: 24, opacity: 0 }}
      animate={isVertical ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.08,
      }}
    >
      {leading}
      {items.map((item) => (
        <DockIcon
          key={item.id}
          item={item}
          mousePosition={mousePosition}
          orientation={orientation}
          itemRef={itemRefs?.[item.id]}
        />
      ))}
      {trailing}
    </motion.div>
  );
}
