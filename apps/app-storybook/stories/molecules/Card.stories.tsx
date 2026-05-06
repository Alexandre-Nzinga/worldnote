import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "@worldnote/ui";

const meta = {
  title: "Design System/Molecules/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Character Name",
    subtitle: "Character · Subtitle",
    children: <p className="text-zinc-400">Card preview</p>,
  },
};
