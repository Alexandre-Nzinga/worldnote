import { ActionMenu } from "@worldnote/ui";

type ProfileMenuProps = {
  username: string;
  onOpenSettings: () => void;
};

export function ProfileMenu({ username, onOpenSettings }: ProfileMenuProps) {
  const initial = username.trim().charAt(0).toUpperCase() || "U";

  return (
    <ActionMenu
      ariaLabel="Profile menu"
      placement="bottom-end"
      onAction={(key) => {
        if (key === "settings") {
          onOpenSettings();
        }
      }}
      items={[{ id: "settings", label: "Settings" }]}
      trigger={
        <button
          type="button"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-wn-rose-500 to-wn-amber-500 text-sm font-semibold text-wn-mono-950 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-wn-mono-500"
          aria-label={`Profile for ${username}`}
        >
          {initial}
        </button>
      }
    />
  );
}
