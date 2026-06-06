import { Button, getHeadingProps, WorldNoteLogo } from "@worldnote/ui";
import { headerCta, navItems } from "@/components/landing/landingContent";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-white/5 bg-wn-bg/80 px-6 py-4 backdrop-blur-md md:px-[46px]">
      <div className="flex items-center gap-3">
        <WorldNoteLogo
          variant="icon"
          tone="white"
          className="h-7 w-7 opacity-90"
          alt="WorldNote"
        />
        <h2 {...getHeadingProps("h3", { tone: "inverse" })}>WorldNote</h2>
      </div>

      <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-wn-mono-400 transition-colors hover:text-wn-mono-50"
            style={{
              fontSize: "14px",
              fontWeight: "var(--font-weight-wn-medium)",
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <Button
        as="a"
        href={headerCta.href}
        variant="primary"
        size="sm"
      >
        {headerCta.label}
      </Button>
    </header>
  );
}
