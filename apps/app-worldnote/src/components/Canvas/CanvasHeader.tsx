import {
  ActionMenu,
  Button,
  MaterialSymbol,
  getHeadingStyle,
  headingClass,
} from "@worldnote/ui";

type CanvasHeaderProps = {
  worldName: string;
  onBackToHome: () => void;
  onOpenVault?: () => void;
};

export function CanvasHeader({
  worldName,
  onBackToHome,
  onOpenVault,
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
        className={`max-w-[min(24rem,calc(100vw-6rem))] min-w-0 truncate whitespace-nowrap text-wn-mono-50 ${headingClass.h4}`}
        style={{
          ...getHeadingStyle("h4"),
          color: "var(--color-wn-mono-50)",
        }}
        title={worldName}
      >
        {worldName}
      </h1>
    </header>
  );
}
