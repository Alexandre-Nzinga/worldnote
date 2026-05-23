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
      description: "Front-face heading",
    },
    subtitle: {
      control: "text",
      description: "Optional supporting line under the title",
    },
    flipped: {
      control: "boolean",
      description: "Shows the logo on the back face",
    },
  },
  args: {
    title: "Aldric Vale",
    subtitle: "NPC · Ranger",
    children: "Exiled scout guarding the northern pass.",
    flipped: false,
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  args: {
    title: "Aldric Vale",
    subtitle: "NPC · Ranger",
    children: "Exiled scout guarding the northern pass.",
  },
};

export const TitleOnly: Story = {
  args: {
    title: "Unnamed location",
    subtitle: undefined,
    children: undefined,
  },
};

export const Flipped: Story = {
  args: {
    ...Default.args,
    flipped: true,
  },
};
