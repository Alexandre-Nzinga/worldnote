import { getBodyTextStyle } from "../../brand/typography/typography.js";
import clsx from "clsx";
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export type TooltipProps = {
  /** Tooltip message */
  content: ReactNode;
  /** Plain-text trigger when `children` is omitted */
  label?: string;
  /** Custom trigger element (must be a single focusable child) */
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

const textTriggerClass =
  "cursor-default border-0 bg-transparent p-0 font-inherit text-wn-mono-950 outline-none focus-visible:ring-2 focus-visible:ring-wn-indigo-500 focus-visible:ring-offset-2";

const panelClassName =
  "pointer-events-none fixed z-[9999] max-w-[16rem] rounded-md border border-wn-border-strong bg-wn-surface-raised px-2.5 py-1 font-normal leading-snug text-wn-text";

const panelStyle: CSSProperties = {
  fontSize: getBodyTextStyle("xs").fontSize,
  fontWeight: 400,
  boxShadow: "none",
};

const arrowClassByPlacement: Record<TooltipPlacement, string> = {
  top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-b border-r border-wn-border-strong",
  bottom:
    "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-t border-l border-wn-border-strong",
  left: "right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-t border-r border-wn-border-strong",
  right:
    "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 border-b border-l border-wn-border-strong",
};

function computePosition(
  triggerRect: DOMRect,
  panelRect: DOMRect,
  placement: TooltipPlacement,
  offset: number,
): Pick<CSSProperties, "top" | "left"> {
  const gap = offset;
  let top = 0;
  let left = 0;

  switch (placement) {
    case "top":
      top = triggerRect.top - panelRect.height - gap;
      left = triggerRect.left + triggerRect.width / 2 - panelRect.width / 2;
      break;
    case "bottom":
      top = triggerRect.bottom + gap;
      left = triggerRect.left + triggerRect.width / 2 - panelRect.width / 2;
      break;
    case "left":
      top = triggerRect.top + triggerRect.height / 2 - panelRect.height / 2;
      left = triggerRect.left - panelRect.width - gap;
      break;
    case "right":
      top = triggerRect.top + triggerRect.height / 2 - panelRect.height / 2;
      left = triggerRect.right + gap;
      break;
  }

  const padding = 8;
  left = Math.max(
    padding,
    Math.min(left, window.innerWidth - panelRect.width - padding),
  );
  top = Math.max(
    padding,
    Math.min(top, window.innerHeight - panelRect.height - padding),
  );

  return { top, left };
}

type TriggerProps = {
  ref?: Ref<HTMLElement>;
  "aria-describedby"?: string;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
};

function wrapTrigger(
  trigger: ReactElement<TriggerProps>,
  triggerRef: RefObject<HTMLElement | null>,
  tooltipId: string,
  open: boolean,
  onShow: () => void,
  onHide: () => void,
): ReactElement {
  const childRef = trigger.props.ref;
  return cloneElement(trigger, {
    ...trigger.props,
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      if (typeof childRef === "function") {
        childRef(node);
      } else if (childRef && typeof childRef === "object") {
        childRef.current = node;
      }
    },
    "aria-describedby": open ? tooltipId : undefined,
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      trigger.props.onMouseEnter?.(event);
      onShow();
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      trigger.props.onMouseLeave?.(event);
      onHide();
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      trigger.props.onFocus?.(event);
      onShow();
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      trigger.props.onBlur?.(event);
      onHide();
    },
  });
}

/** Dark tooltip shown on hover or keyboard focus of the trigger. */
export function Tooltip({
  content,
  label = "Hover or focus me",
  children,
  placement = "top",
  showArrow = false,
  offset = 8,
  isDisabled,
  className,
  classNames,
}: TooltipProps) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<CSSProperties>({
    top: -9999,
    left: -9999,
    visibility: "hidden",
  });

  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) {
      return;
    }

    const next = computePosition(
      trigger.getBoundingClientRect(),
      panel.getBoundingClientRect(),
      placement,
      offset,
    );
    setPosition({
      top: next.top,
      left: next.left,
      visibility: "visible",
    });
  }, [offset, placement]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      reposition();
    });
    const onLayoutChange = () => {
      reposition();
    };

    window.addEventListener("scroll", onLayoutChange, true);
    window.addEventListener("resize", onLayoutChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onLayoutChange, true);
      window.removeEventListener("resize", onLayoutChange);
    };
  }, [open, reposition]);

  const show = () => {
    if (isDisabled) {
      return;
    }
    setOpen(true);
  };

  const hide = () => {
    setOpen(false);
    setPosition({
      top: -9999,
      left: -9999,
      visibility: "hidden",
    });
  };

  const defaultTrigger = label ? (
    <button type="button" className={textTriggerClass}>
      {label}
    </button>
  ) : null;

  const triggerNode = children ?? defaultTrigger;
  if (!isValidElement(triggerNode)) {
    return null;
  }

  const trigger = wrapTrigger(
    triggerNode as ReactElement<TriggerProps>,
    triggerRef,
    tooltipId,
    open,
    show,
    hide,
  );

  const panel = open
    ? createPortal(
        <div
          ref={panelRef}
          id={tooltipId}
          role="tooltip"
          style={{ ...panelStyle, ...position }}
          className={clsx(
            panelClassName,
            className,
            classNames?.base,
            classNames?.content,
          )}
        >
          {content}
          {showArrow ? (
            <span
              aria-hidden
              className={clsx(
                "absolute h-2 w-2 rotate-45 bg-wn-surface-raised",
                arrowClassByPlacement[placement],
                classNames?.arrow,
              )}
            />
          ) : null}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {trigger}
      {panel}
    </>
  );
}
