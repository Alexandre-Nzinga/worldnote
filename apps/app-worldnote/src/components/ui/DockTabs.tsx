import { MaterialSymbol, usePrefersReducedMotion } from "@worldnote/ui";
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

type DockIconProps = {
  item: DockTabItem;
  mouseX: MotionValue<number>;
  itemRef?: RefObject<HTMLDivElement | null>;
};

function DockIcon({ item, mouseX, itemRef }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
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
          item.isActive ? "ring-2 ring-wn-mono-50 ring-offset-2 ring-offset-wn-mono-900" : ""
        }`}
        animate={{
          y: isClicked ? 2 : isHovered && !item.disabled ? -6 : 0,
        }}
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
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{
          opacity: isHovered && !item.disabled ? 1 : 0,
          y: isHovered && !item.disabled ? -18 : 10,
          scale: isHovered && !item.disabled ? 1 : 0.8,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-wn-mono-700 bg-wn-mono-950/90 px-2 py-1 text-xs font-semibold text-wn-mono-100 backdrop-blur-sm"
      >
        {item.name}
      </motion.span>
    </motion.div>
  );
}

type DockTabsProps = {
  items: DockTabItem[];
  className?: string;
  itemRefs?: Partial<Record<string, RefObject<HTMLDivElement | null>>>;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function DockTabs({
  items,
  className,
  itemRefs,
  leading,
  trailing,
}: DockTabsProps) {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);

  return (
    <motion.div
      onMouseMove={(event) => mouseX.set(event.pageX)}
      onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
      className={`mx-auto flex h-18 items-end gap-3 rounded-3xl border border-wn-mono-700/80 bg-wn-mono-900/85 px-3 pb-3 pt-2 shadow-xl backdrop-blur-md ${className ?? ""}`}
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
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
          mouseX={mouseX}
          itemRef={itemRefs?.[item.id]}
        />
      ))}
      {trailing}
    </motion.div>
  );
}
