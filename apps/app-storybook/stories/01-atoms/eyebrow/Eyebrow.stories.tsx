import type { Meta, StoryObj } from "@storybook/react";
import { Eyebrow } from "@worldnote/ui";

const meta = {
  title: "01-Atoms/Eyebrow",
  component: Eyebrow,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    tone: { control: "radio", options: ["azure", "mono"] },
    showDot: { control: "boolean" },
  },
  args: {
    children: "About us",
    tone: "azure",
    showDot: true,
  },
} satisfies Meta<typeof Eyebrow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutDot: Story = {
  args: { showDot: false, children: "FAQ" },
};

export const MonoTone: Story = {
  args: { tone: "mono", children: "Services" },
};
