import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "@worldnote/ui";

const meta = {
  title: "02-Molecules/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Header title",
    },
    subtitle: {
      control: "text",
      description: "Optional supporting line in the header",
    },
    children: {
      control: "text",
      description: "Body content below the header divider",
    },
    className: {
      control: "text",
      description: "Additional classes applied to the card root",
    },
  },
  args: {
    children: "Card body content goes here.",
  },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHeading: Story = {
  args: {
    title: "Card title",
    children:
      "Card body content goes here. This demonstrates a card with a heading section separated by a border.",
  },
};


export const ConstrainedWidth: Story = {
  args: {
    title: "Card title",
    children: "This card has a custom className to limit its max width.",
    className: "max-w-xs",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
};
