import type { Meta, StoryObj } from "@storybook/react";
import { Card, getBodyTextStyle } from "@worldnote/ui";

const meta = {
  title: "Molecules/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Content Only",
  args: {
    title: "",
  },
  render: () => (
    <div className="mx-auto w-full max-w-5xl">
      <div
        className="rounded-2xl border-2 px-5 py-4"
        style={{
          borderColor: "var(--color-wn-mono-200)",
          backgroundColor: " ",
          boxShadow: "0 2px 8px color-mix(in oklab, var(--color-wn-mono-950) 6%, transparent)",
        }}
      >
        <p style={{ ...getBodyTextStyle("body"), color: "var(--color-wn-mono-900)", fontWeight: 500 }}>
          A card with only a content section and no heading.
        </p>
      </div>
    </div>
  ),
};

export const WithHeading: Story = {
  name: "With Heading",
  args: {
    title: "",
  },
  render: () => (
    <div className="mx-auto w-full max-w-5xl">
      <div
        className="overflow-hidden rounded-2xl border-2"
        style={{
          borderColor: "var(--color-wn-mono-200)",
          backgroundColor: " ",
          boxShadow: "0 2px 8px color-mix(in oklab, var(--color-wn-mono-950) 6%, transparent)",
        }}
      >
        <div className="px-5 py-3">
          <p style={{ ...getBodyTextStyle("body"), color: "var(--color-wn-mono-900)", fontWeight: 600 }}>Card title</p>
        </div>
        <div style={{ borderTop: "1px solid var(--color-wn-mono-200)" }} />
        <div className="px-5 py-4">
          <p style={{ ...getBodyTextStyle("body"), color: "var(--color-wn-mono-900)", fontWeight: 500 }}>
            Card body content goes here. This demonstrates a card with a heading section separated by a border.
          </p>
        </div>
      </div>
    </div>
  ),
};

