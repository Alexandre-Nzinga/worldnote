import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";

type ProfileMenuProps = {
  username: string;
  onOpenSettings: () => void;
};

export function ProfileMenu({ username, onOpenSettings }: ProfileMenuProps) {
  const initial = username.trim().charAt(0).toUpperCase() || "U";

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <button
          type="button"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-wn-rose-500 to-wn-amber-500 text-sm font-semibold text-wn-mono-950 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-wn-mono-500"
          aria-label={`Profile for ${username}`}
        >
          {initial}
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Profile menu"
        classNames={{
          base: "border border-wn-mono-700 bg-wn-mono-900",
        }}
        itemClasses={{
          base: "text-wn-mono-100 data-[hover=true]:bg-wn-mono-800",
        }}
        onAction={(key) => {
          if (key === "settings") {
            onOpenSettings();
          }
        }}
      >
        <DropdownItem key="settings">Settings</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
