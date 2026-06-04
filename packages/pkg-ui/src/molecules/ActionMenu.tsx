import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import type { Key, ReactNode } from "react";

export type ActionMenuPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end";

export type ActionMenuItem = {
  id: string;
  label: string;
  /** Shown before the label (HeroUI v2 `startContent`; v3 uses a child icon). */
  icon?: ReactNode;
  variant?: "default" | "danger";
};

export type ActionMenuProps = {
  /** Accessible name for the menu list. */
  ariaLabel: string;
  /** Pressable element that opens the menu (e.g. HeroUI `Button`). */
  trigger: ReactNode;
  items: ActionMenuItem[];
  placement?: ActionMenuPlacement;
  onAction: (key: Key) => void;
};

const menuPopoverClassName =
  "rounded-xl border border-wn-mono-700 bg-wn-mono-800 p-1 shadow-lg";

const menuListClassName = "bg-wn-mono-800";

const menuItemClassName =
  "rounded-lg font-semibold text-wn-mono-100 outline-none ring-0 data-[hover=true]:bg-wn-mono-700 data-[hover=true]:!text-wn-mono-50 data-[focus=true]:bg-wn-mono-700 data-[focus=true]:!text-wn-mono-50 data-[focus=true]:outline data-[focus=true]:outline-2 data-[focus=true]:outline-offset-0 data-[focus=true]:outline-wn-mono-50 data-[focus-visible=true]:outline data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-0 data-[focus-visible=true]:outline-wn-mono-50";

/**
 * HeroUI dropdown menu on `wn-mono-800` surface (WorldNote dark theme).
 */
export function ActionMenu({
  ariaLabel,
  trigger,
  items,
  placement = "bottom-start",
  onAction,
}: ActionMenuProps) {
  return (
    <Dropdown
      placement={placement}
      classNames={{
        content: menuPopoverClassName,
      }}
    >
      <DropdownTrigger>{trigger}</DropdownTrigger>
      <DropdownMenu
        aria-label={ariaLabel}
        onAction={onAction}
        classNames={{
          base: menuListClassName,
        }}
        itemClasses={{
          base: menuItemClassName,
          title:
            "font-semibold text-wn-mono-100 group-data-[hover=true]:!text-wn-mono-50 group-data-[focus=true]:!text-wn-mono-50",
        }}
      >
        {items.map((item) => (
          <DropdownItem
            key={item.id}
            startContent={item.icon}
            color={item.variant === "danger" ? "danger" : undefined}
            className={
              item.variant === "danger" ? "text-danger" : undefined
            }
          >
            {item.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
