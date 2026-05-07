import type { Meta, StoryObj } from "@storybook/react";
import { Button, getBodyTextStyle } from "@worldnote/ui";

const meta = {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "danger"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    isDisabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    isIconOnly: { control: "boolean" },
  },
  args: {
    children: "Button",
    variant: "primary",
    size: "md", 
    isDisabled: false,
    fullWidth: false,
    isIconOnly: false,
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

/** Same four variants with token notes (mono scale + danger red). */
export const Colors: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="primary">Primary</Button>
        <span style={getBodyTextStyle("xs")}>
          Gradient navy → zinc-950, zinc-50 text
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="secondary">Secondary</Button>
        <span style={getBodyTextStyle("xs")}>
          zinc-950 surface, zinc-100 text
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost">Ghost</Button>
        <span style={getBodyTextStyle("xs")}>
          Transparent, zinc-300 text
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="danger">Danger</Button>
        <span style={getBodyTextStyle("xs")}>wn-red-500 / wn-red-600 hover</span>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button>Default</Button>
      <Button isDisabled>Disabled</Button>
    </div>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div className="w-[420px]">
      <Button fullWidth>Full width button</Button>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button isIconOnly size="sm" aria-label="Star">
        ★
      </Button>
      <Button isIconOnly size="md" aria-label="Star">
        ★
      </Button>
      <Button isIconOnly size="lg" aria-label="Star">
        ★
      </Button>
    </div>
  ),
};
