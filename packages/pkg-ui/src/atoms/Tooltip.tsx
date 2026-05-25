import { Tooltip as HeroUITooltip } from "@heroui/react";
import clsx from "clsx";
import type { ReactNode } from "react";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export type TooltipProps = {
  /** Tooltip message */
  content: ReactNode;
  /** Plain-text trigger when `children` is omitted */
  label?: string;
  /** Custom trigger element (must be focusable or use a focusable child) */
  children?: ReactNode;
  placement?: TooltipPlacement;
  showArrow?: boolean;
  /** Distance from trigger in px */
  offset?: number;
  isDisabled?: boolean;
  className?: string;
  classNames?: {
    base?: string;
    content?: string;
    arrow?: string;
  };
};

const tooltipBaseClass =
  "!rounded-md !border-0 !bg-wn-mono-950 !px-3 !py-1.5 !text-sm !font-semibold !text-wn-mono-50";

const tooltipArrowClass = "!bg-wn-mono-950 !fill-wn-mono-950";

const textTriggerClass =
  "cursor-default border-0 bg-transparent p-0 font-inherit text-wn-mono-950 outline-none focus-visible:ring-2 focus-visible:ring-wn-indigo-500 focus-visible:ring-offset-2";

/** Dark tooltip shown on hover or keyboard focus of the trigger. */
export function Tooltip({
  content,
  label = "Hover or focus me",
  children,
  placement = "top",
  showArrow = true,
  offset = 10,
  isDisabled,
  className,
  classNames,
}: TooltipProps) {
  const trigger =
    children ??
    (label ? (
      <button type="button" className={textTriggerClass}>
        {label}
      </button>
    ) : null);

  return (
    <HeroUITooltip
      content={content}
      placement={placement}
      showArrow={showArrow}
      offset={offset}
      radius="md"
      shadow="none"
      color="default"
      isDisabled={isDisabled}
      closeDelay={0}
      className={className}
      classNames={{
        base: clsx(tooltipBaseClass, classNames?.base),
        content: clsx("!font-semibold !text-wn-mono-50", classNames?.content),
        arrow: clsx(tooltipArrowClass, classNames?.arrow),
      }}
    >
      {trigger}
    </HeroUITooltip>
  );
}
