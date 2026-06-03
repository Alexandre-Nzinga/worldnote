import type { Meta, StoryObj } from "@storybook/react";
import { NumberBadge } from "@worldnote/ui";

const meta = {
  title: "01-Atoms/NumberBadge",
  component: NumberBadge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    tone: { control: "radio", options: ["azure", "mono"] },
    size: { control: "radio", options: ["sm", "md"] },
  },
  args: {
    value: 1,
    tone: "azure",
    size: "md",
  },
} satisfies Meta<typeof NumberBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: "sm", value: 2 },
};

export const Row: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4].map((n) => (
        <NumberBadge key={n} value={n} size="sm" />
      ))}
    </div>
  ),
};
