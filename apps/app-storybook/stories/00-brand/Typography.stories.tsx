import type { Meta, StoryObj } from "@storybook/react";
import {
  Eyebrow,
  bodyTextTokens,
  getBodyTextStyle,
  getHeadingStyle,
  headingClass,
  headingTokens,
} from "@worldnote/ui";

const headingScale = [
  {
    label: "Display",
    tag: "display",
    token: headingTokens.display,
    className: headingClass.display,
  },
  {
    label: "Heading 1",
    tag: "h1",
    token: headingTokens.h1,
    className: headingClass.h1,
  },
  {
    label: "Heading 2",
    tag: "h2",
    token: headingTokens.h2,
    className: headingClass.h2,
  },
  {
    label: "Heading 3",
    tag: "h3",
    token: headingTokens.h3,
    className: headingClass.h3,
  },
  {
    label: "Heading 4",
    tag: "h4",
    token: headingTokens.h4,
    className: headingClass.h4,
  },
  {
    label: "Heading 5",
    tag: "h5",
    token: headingTokens.h5,
    className: headingClass.h5,
  },
  {
    label: "Heading 6",
    tag: "h6",
    token: headingTokens.h6,
    className: headingClass.h6,
  },
] as const;

const bodyScale = [
  { level: "body", token: bodyTextTokens.body, range: "1rem" },
  { level: "small", token: bodyTextTokens.small, range: "0.889rem -> 0.8rem" },
  { level: "xs", token: bodyTextTokens.xs, range: "0.79rem -> 0.64rem" },
] as const;

const meta = {
  title: "00-Brand/Typography",
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Typography: Story = {
  render: () => (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 font-sans">
      <div className="space-y-2">
        <h1 className={headingClass.h1} style={getHeadingStyle("h1")}>
          Typography
        </h1>
        <p
          className="max-w-2xl leading-6"
          style={{ ...getBodyTextStyle("body"), fontWeight: 500 }}
        >
          Urbanist is our default typeface across products. This page shows the
          heading scale plus practical body text styles for UI copy.
        </p>
      </div>

      <section className="space-y-3">
        <h3 className={headingClass.h3} style={getHeadingStyle("h3")}>
          Eyebrow
        </h3>
        <p className="max-w-3xl leading-6" style={getBodyTextStyle("body")}>
          Monospace uppercase labels for section markers (Alture-style).
        </p>
        <div className="flex flex-wrap gap-4 rounded-2xl border border-wn-mono-200 px-4 py-4">
          <Eyebrow>About us</Eyebrow>
          <Eyebrow showDot={false}>
            FAQ
          </Eyebrow>
          <Eyebrow tone="mono">Services</Eyebrow>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className={headingClass.h3} style={getHeadingStyle("h3")}>
          Headings
        </h3>
        <p className="max-w-3xl leading-6" style={getBodyTextStyle("body")}>
          Six heading levels are defined via custom CSS variables and semantic
          classes.
        </p>
        <div className="overflow-hidden rounded-2xl border border-wn-mono-200">
          {headingScale.map(({ label, tag, token, className }) => {
            const sample = "Building better worlds";

            return (
              <div
                key={tag}
                className="grid grid-cols-[130px_1fr] gap-4 border-b border-wn-mono-800/80 px-4 py-4 last:border-b-0"
              >
                <div className="space-y-1 pt-1">
                  <p
                    style={{
                      ...getBodyTextStyle("small"),
                      color: "var(--color-wn-mono-200)",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </p>
                  <code
                    className="block text-wn-mono-500"
                    style={getBodyTextStyle("xs")}
                  >
                    size: {token.size}
                  </code>
                  <code
                    className="block text-wn-mono-500"
                    style={getBodyTextStyle("xs")}
                  >
                    spacingRem: {token.spacingRem}
                  </code>
                  <code
                    className="block text-wn-mono-500"
                    style={getBodyTextStyle("xs")}
                  >
                    color: {token.color}
                  </code>
                  <code
                    className="block text-wn-mono-600"
                    style={getBodyTextStyle("xs")}
                  >
                    {className}
                  </code>
                </div>
                <div className="min-w-0">
                  {tag === "display" && (
                    <p
                      className={className}
                      style={getHeadingStyle("display")}
                      role="heading"
                      aria-level={1}
                    >
                      {sample}
                    </p>
                  )}
                  {tag === "h1" && (
                    <h1 className={className} style={getHeadingStyle(tag)}>
                      {sample}
                    </h1>
                  )}
                  {tag === "h2" && (
                    <h2 className={className} style={getHeadingStyle(tag)}>
                      {sample}
                    </h2>
                  )}
                  {tag === "h3" && (
                    <h3 className={className} style={getHeadingStyle(tag)}>
                      {sample}
                    </h3>
                  )}
                  {tag === "h4" && (
                    <h4 className={className} style={getHeadingStyle(tag)}>
                      {sample}
                    </h4>
                  )}
                  {tag === "h5" && (
                    <h5 className={className} style={getHeadingStyle(tag)}>
                      {sample}
                    </h5>
                  )}
                  {tag === "h6" && (
                    <h6 className={className} style={getHeadingStyle(tag)}>
                      {sample}
                    </h6>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className={headingClass.h3} style={getHeadingStyle("h3")}>
          Body text
        </h3>
        <div className="overflow-hidden rounded-2xl border border-wn-mono-200">
          {bodyScale.map(({ level, token, range }) => (
            <div
              key={level}
              className="grid grid-cols-[220px_160px_160px_1fr] gap-4 border-b border-wn-mono-800/80 px-4 py-4 last:border-b-0"
            >
              <p
                style={{
                  ...getBodyTextStyle("small"),
                  color: "var(--color-wn-mono-200)",
                  fontWeight: 600,
                }}
              >
                {token.label}
              </p>
              <code className="text-wn-mono-500" style={getBodyTextStyle("xs")}>
                {token.size}
              </code>
              <code className="text-wn-mono-500" style={getBodyTextStyle("xs")}>
                {range}
              </code>
              <p className="leading-7" style={getBodyTextStyle(level)}>
                Building better worlds
              </p>
            </div>
          ))}
          <div
            className="px-4 py-3 text-wn-mono-400"
            style={getBodyTextStyle("xs")}
          >
            Body definitions are tokenized in <code>@worldnote/ui</code> and
            rendered here from those source tokens.
          </div>
        </div>
      </section>
    </div>
  ),
};
