import { UserAvatar, ActionMenu } from "@worldnote/ui";
import { useSettings } from "../../hooks/useSettings.js";
import {
  avatarColorFallbackClassName,
  normalizeAvatarColor,
} from "../../services/settings/avatarColorSettings.js";

type ProfileMenuProps = {
  username: string;
  onOpenSettings?: () => void;
};

export function ProfileMenu({ username, onOpenSettings }: ProfileMenuProps) {
  const avatarColor = useSettings((state) =>
    normalizeAvatarColor(state.settings?.avatarColor),
  );

  return (
    <ActionMenu
      ariaLabel="Profile menu"
      placement="bottom-end"
      onAction={(key) => {
        if (key === "settings") {
          onOpenSettings?.();
        }
      }}
      items={[{ id: "settings", label: "Settings" }]}
      trigger={
        <button
          type="button"
          className="rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-wn-mono-500"
          aria-label={`Profile for ${username}`}
        >
          <UserAvatar
            username={username}
            fallbackClassName={avatarColorFallbackClassName(avatarColor)}
          />
        </button>
      }
    />
  );
}
