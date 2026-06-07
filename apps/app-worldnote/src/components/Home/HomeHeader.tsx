import { WorldNoteLogo, getHeadingProps } from "@worldnote/ui";
import { ProfileMenu } from "./ProfileMenu.js";

type HomeHeaderProps = {
  username: string;
  onOpenSettings: () => void;
};

export function HomeHeader({ username, onOpenSettings }: HomeHeaderProps) {
  return (
    <header className="relative z-10 flex shrink-0 items-center justify-between px-[46px] pt-7">
      <div className="flex items-center gap-3">
        <WorldNoteLogo
          variant="icon"
          tone="white"
          className="h-7 w-7 opacity-90"
          alt="WorldNote"
        />
        <h2 {...getHeadingProps("h3", { tone: "inverse" })}>WorldNote</h2>
      </div>
      <ProfileMenu username={username} onOpenSettings={onOpenSettings} />
    </header>
  );
}
