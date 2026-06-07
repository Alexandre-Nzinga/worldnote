"use client";

import { Button, WorldNoteLogo } from "@worldnote/ui";
import { landingCopy } from "@/components/landing/shared/copy";
import { useGithubRelease } from "@/hooks/useGithubRelease";
import { RELEASES_PAGE_URL } from "@/services/github/releases";

/** Sticky top navigation with logo and download shortcut. */
export function SiteNav() {
  const { primaryHref } = useGithubRelease();
  const { nav } = landingCopy;

  return (
    <header className="sticky top-0 z-50 border-b border-wn-border/60 bg-wn-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-10 lg:px-16">
        <a
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
          aria-label="WorldNote home"
        >
          <WorldNoteLogo variant="icon" tone="white" className="h-8" alt="" />
          <span className="hidden text-wn-body font-wn-semibold text-wn-text sm:inline">
            WorldNote
          </span>
        </a>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            size="sm"
            as="a"
            href={RELEASES_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="!min-h-9 !px-5 !py-2"
          >
            {nav.github}
          </Button>
          <Button
            variant="white"
            size="sm"
            as="a"
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="!min-h-9 !px-5 !py-2"
          >
            {nav.download}
          </Button>
        </nav>
      </div>
    </header>
  );
}
