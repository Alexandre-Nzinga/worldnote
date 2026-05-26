import { ActionMenu, Button } from "@worldnote/ui";
import { RemixIcon } from "./RemixIcon.js";

type CanvasHeaderProps = {
  worldName: string;
  onBackToLauncher: () => void;
};

export function CanvasHeader({ worldName, onBackToLauncher }: CanvasHeaderProps) {
  return (
    <header className="pointer-events-auto absolute left-4 top-4 z-20 flex max-w-[calc(100vw-2rem)] flex-nowrap items-center gap-3">
      <ActionMenu
        ariaLabel="World menu"
        placement="bottom-start"
        onAction={(key) => {
          if (key === "launcher") {
            onBackToLauncher();
          }
        }}
        items={[
          {
            id: "launcher",
            label: "Back to launcher",
            icon: <RemixIcon name="ri-home-line" />,
          },
        ]}
        trigger={
          <Button
            variant="tertiary"
            size="sm"
            isIconOnly
            aria-label="World menu"
            className="min-w-9 px-0"
          >
            <RemixIcon name="ri-menu-line" className="text-lg" />
          </Button>
        }
      />
      <h1
        className="min-w-0 flex-1 truncate whitespace-nowrap text-lg font-semibold leading-tight text-wn-mono-50"
        title={worldName}
      >
        {worldName}
      </h1>
    </header>
  );
}
