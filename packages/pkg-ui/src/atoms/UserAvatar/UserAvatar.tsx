import { Avatar } from "@heroui/react";
import clsx from "clsx";
import type { ComponentProps } from "react";

export type UserAvatarSize = "sm" | "md";

const sizeClassName: Record<UserAvatarSize, string> = {
  sm: "!h-9 !w-9 min-h-9 min-w-9",
  md: "!h-10 !w-10 min-h-10 min-w-10",
};

export type UserAvatarProps = Omit<
  ComponentProps<typeof Avatar>,
  "name" | "size" | "radius" | "showFallback" | "getInitials" | "classNames"
> & {
  username: string;
  size?: UserAvatarSize;
  fallbackClassName?: string;
  /** Styles the HeroUI avatar shell (e.g. menu trigger affordances). */
  className?: string;
};

function usernameInitial(username: string): string {
  return username.trim().charAt(0).toUpperCase() || "U";
}

/** HeroUI avatar with a single-letter fallback from the username. */
export function UserAvatar({
  username,
  size = "sm",
  fallbackClassName,
  className,
  ...props
}: UserAvatarProps) {
  return (
    <Avatar
      {...props}
      name={username}
      showFallback
      radius="full"
      getInitials={usernameInitial}
      classNames={{
        base: clsx(sizeClassName[size], className, fallbackClassName),
        name: "text-sm font-semibold text-wn-mono-950",
      }}
    />
  );
}
