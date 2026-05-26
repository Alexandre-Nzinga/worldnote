import type { Meta, StoryObj } from "@storybook/react";
import { Pill, type PillSize, type PillTone } from "@worldnote/ui";

const tones: PillTone[] = [
  "mono",
  "mono-dark",
  "azure",
  "indigo",
  "amber",
  "lime",
  "rose",
  "outline",
];

const meta = {
  title: "01-Atoms/Pill",
  component: Pill,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    tone: { control: "select", options: [undefined, ...tones] },
    size: { control: "radio", options: ["sm", "md"] satisfies PillSize[] },
    children: { control: "text" },
  },
  args: {
    children: "Vehicle",
    tone: "indigo",
    size: "md",
  },
} satisfies Meta<typeof Pill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TagOutline: Story = {
  args: {
    children: "hero",
    tone: "outline",
    size: "sm",
  },
};

export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 rounded-2xl bg-wn-mono-950 p-6">
      {tones.map((tone) => (
        <Pill key={tone} tone={tone}>
          {tone}
        </Pill>
      ))}
    </div>
  ),
};
