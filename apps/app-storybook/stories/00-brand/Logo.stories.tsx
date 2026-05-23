import type { Meta, StoryObj } from "@storybook/react";
import { getBodyTextStyle, getHeadingStyle, headingClass, getWorldNoteLogoSrc, WorldNoteLogo } from "@worldnote/ui";

const meta = {
  title: "00-Brand/Logo",
  component: WorldNoteLogo,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof WorldNoteLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OfficialVariants: Story = {
  name: "Logo",
  render: () => (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className={headingClass.h6} style={getHeadingStyle("h6")}>
          PNG
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div
            className="space-y-2 rounded-xl border p-4"
            style={{
              borderColor: "var(--color-wn-mono-700)",
              backgroundColor: "var(--color-wn-mono-950)",
            }}
          >
            <p style={getBodyTextStyle("xs")}>Icon White</p>
            <WorldNoteLogo
              variant="icon"
              tone="white"
              format="png"
              className="h-12 w-auto"
            />
            <a
              href={getWorldNoteLogoSrc("icon", "white", "png")}
              download="worldnote-logo-icon-white.png"
              className="inline-block underline"
              style={getBodyTextStyle("xs")}
            >
              Download
            </a>
          </div>
          <div
            className="space-y-2 rounded-xl border p-4"
            style={{
              borderColor: "var(--color-wn-mono-200)",
              backgroundColor: "var(--color-wn-mono-50)",
            }}
          >
            <p style={{ ...getBodyTextStyle("xs"), color: "var(--color-wn-mono-700)" }}>Icon Black</p>
            <WorldNoteLogo
              variant="icon"
              tone="black"
              format="png"
              className="h-12 w-auto"
            />
            <a
              href={getWorldNoteLogoSrc("icon", "black", "png")}
              download="worldnote-logo-icon-black.png"
              className="inline-block underline"
              style={{ ...getBodyTextStyle("xs"), color: "var(--color-wn-mono-700)" }}
            >
              Download
            </a>
          </div>
          <div
            className="space-y-2 rounded-xl border p-4"
            style={{
              borderColor: "var(--color-wn-mono-700)",
              backgroundColor: "var(--color-wn-mono-950)",
            }}
          >
            <p style={getBodyTextStyle("xs")}>Wordmark White</p>
            <WorldNoteLogo
              variant="wordmark"
              tone="white"
              format="png"
              className="h-12 w-auto"
            />
            <a
              href={getWorldNoteLogoSrc("wordmark", "white", "png")}
              download="worldnote-logo-wordmark-white.png"
              className="inline-block underline"
              style={getBodyTextStyle("xs")}
            >
              Download
            </a>
          </div>
          <div
            className="space-y-2 rounded-xl border p-4"
            style={{
              borderColor: "var(--color-wn-mono-200)",
              backgroundColor: "var(--color-wn-mono-50)",
            }}
          >
            <p style={{ ...getBodyTextStyle("xs"), color: "var(--color-wn-mono-700)" }}>Wordmark Black</p>
            <WorldNoteLogo
              variant="wordmark"
              tone="black"
              format="png"
              className="h-12 w-auto"
            />
            <a
              href={getWorldNoteLogoSrc("wordmark", "black", "png")}
              download="worldnote-logo-wordmark-black.png"
              className="inline-block underline"
              style={{ ...getBodyTextStyle("xs"), color: "var(--color-wn-mono-700)" }}
            >
              Download
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className={headingClass.h6} style={getHeadingStyle("h6")}>
          SVG
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div
            className="space-y-2 rounded-xl border p-4"
            style={{
              borderColor: "var(--color-wn-mono-700)",
              backgroundColor: "var(--color-wn-mono-950)",
            }}
          >
            <p style={getBodyTextStyle("xs")}>Icon White</p>
            <WorldNoteLogo
              variant="icon"
              tone="white"
              format="svg"
              className="h-12 w-auto"
            />
            <a
              href={getWorldNoteLogoSrc("icon", "white", "svg")}
              download="worldnote-logo-icon-white.svg"
              className="inline-block underline"
              style={getBodyTextStyle("xs")}
            >
              Download
            </a>
          </div>
          <div
            className="space-y-2 rounded-xl border p-4"
            style={{
              borderColor: "var(--color-wn-mono-200)",
              backgroundColor: "var(--color-wn-mono-50)",
            }}
          >
            <p style={{ ...getBodyTextStyle("xs"), color: "var(--color-wn-mono-700)" }}>Icon Black</p>
            <WorldNoteLogo
              variant="icon"
              tone="black"
              format="svg"
              className="h-12 w-auto"
            />
            <a
              href={getWorldNoteLogoSrc("icon", "black", "svg")}
              download="worldnote-logo-icon-black.svg"
              className="inline-block underline"
              style={{ ...getBodyTextStyle("xs"), color: "var(--color-wn-mono-700)" }}
            >
              Download
            </a>
          </div>
          <div
            className="space-y-2 rounded-xl border p-4"
            style={{
              borderColor: "var(--color-wn-mono-700)",
              backgroundColor: "var(--color-wn-mono-950)",
            }}
          >
            <p style={getBodyTextStyle("xs")}>Wordmark White</p>
            <WorldNoteLogo
              variant="wordmark"
              tone="white"
              format="svg"
              className="h-12 w-auto"
            />
            <a
              href={getWorldNoteLogoSrc("wordmark", "white", "svg")}
              download="worldnote-logo-wordmark-white.svg"
              className="inline-block underline"
              style={getBodyTextStyle("xs")}
            >
              Download
            </a>
          </div>
          <div
            className="space-y-2 rounded-xl border p-4"
            style={{
              borderColor: "var(--color-wn-mono-200)",
              backgroundColor: "var(--color-wn-mono-50)",
            }}
          >
            <p style={{ ...getBodyTextStyle("xs"), color: "var(--color-wn-mono-700)" }}>Wordmark Black</p>
            <WorldNoteLogo
              variant="wordmark"
              tone="black"
              format="svg"
              className="h-12 w-auto"
            />
            <a
              href={getWorldNoteLogoSrc("wordmark", "black", "svg")}
              download="worldnote-logo-wordmark-black.svg"
              className="inline-block underline"
              style={{ ...getBodyTextStyle("xs"), color: "var(--color-wn-mono-700)" }}
            >
              Download
            </a>
          </div>
        </div>
      </section>
    </div>
  ),
};

