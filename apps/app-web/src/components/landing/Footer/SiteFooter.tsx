"use client";

import { WorldNoteLogo } from "@worldnote/ui";
import { landingCopy } from "@/components/landing/shared/copy";

/** Minimal footer with logo, tagline, and external navigation links. */
export function SiteFooter() {
  const { footer } = landingCopy;

  return (
    <footer className="border-t border-wn-border px-6 py-12 md:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <WorldNoteLogo
            variant="wordmark"
            tone="white"
            className="h-6 w-auto"
            alt="WorldNote"
          />
          <p className="max-w-xs text-wn-small italic text-wn-text-muted">
            {footer.tagline}
          </p>
        </div>

        <nav aria-label="External links">
          <ul className="flex flex-col gap-3">
            {footer.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wn-small text-wn-text-muted transition-colors hover:text-wn-text"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mx-auto mt-10 max-w-6xl text-wn-xs text-wn-text-subtle">
        © {new Date().getFullYear()} WorldNote. Built for worldbuilders.
      </p>
    </footer>
  );
}
