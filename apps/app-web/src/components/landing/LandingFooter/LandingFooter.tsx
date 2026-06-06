import { getBodyTextStyle } from "@worldnote/ui";
import { footerContent } from "@/components/landing/landingContent";

export function LandingFooter() {
  return (
    <footer className="mx-auto w-full max-w-[1008px] border-t border-white/10 pt-12 pb-8">
      <p
        className="mb-6 text-center text-wn-mono-300"
        style={{
          ...getBodyTextStyle("body"),
          fontWeight: "var(--font-weight-wn-medium)",
        }}
      >
        {footerContent.tagline}
      </p>

      <nav
        className="mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        aria-label="Footer"
      >
        {footerContent.links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-wn-mono-500 transition-colors hover:text-wn-mono-300"
            style={getBodyTextStyle("small")}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <p className="text-center" style={getBodyTextStyle("small")}>
        {footerContent.copyright}
      </p>
    </footer>
  );
}
