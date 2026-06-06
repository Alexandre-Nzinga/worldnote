import {
  ActionMenu,
  Button,
  MaterialSymbol,
  getHeadingProps,
} from "@worldnote/ui";

type CanvasHeaderProps = {
  worldName: string;
  onBackToHome: () => void;
  onOpenVault?: () => void;
  onOpenSettings?: () => void;
};

export function CanvasHeader({
  worldName,
  onBackToHome,
  onOpenVault,
  onOpenSettings,
}: CanvasHeaderProps) {
  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: <MaterialSymbol name="home" className="text-[20px]" />,
    },
    ...(onOpenVault
      ? [
          {
            id: "vault",
            label: "Vault",
            icon: <MaterialSymbol name="layers" className="text-[20px]" />,
          },
        ]
      : []),
    ...(onOpenSettings
      ? [
          {
            id: "settings",
            label: "Settings",
            icon: <MaterialSymbol name="settings" className="text-[20px]" />,
          },
        ]
      : []),
  ];

  return (
    <header className="pointer-events-auto absolute left-4 top-4 z-30 flex items-center gap-3">
      <div className="shrink-0">
        <ActionMenu
          ariaLabel="World menu"
          placement="bottom-start"
          onAction={(key) => {
            if (key === "home") {
              onBackToHome();
              return;
            }
            if (key === "vault") {
              onOpenVault?.();
              return;
            }
            if (key === "settings") {
              onOpenSettings?.();
            }
          }}
          items={menuItems}
          trigger={
            <Button
              variant="tertiary"
              size="sm"
              isIconOnly
              aria-label="World menu"
              className="min-w-9 px-0"
            >
              <MaterialSymbol name="menu" className="text-lg" />
            </Button>
          }
        />
      </div>
      <h1
        {...getHeadingProps("h4", {
          tone: "inverse",
          className:
            "max-w-[min(24rem,calc(100vw-6rem))] min-w-0 truncate whitespace-nowrap",
        })}
        title={worldName}
      >
        {worldName}
      </h1>
    </header>
  );
}
