import type { Meta, StoryObj } from "@storybook/react";
import { Button, getBodyTextStyle } from "@worldnote/ui";

const meta = {
  title: "01-Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "danger"],
      description: "Visual style mapped to WorldNote color tokens",
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Height, padding, and type scale",
    },
    children: {
      control: "text",
      description: "Button label or icon content",
    },
    isDisabled: {
      control: "boolean",
      description: "Disables interaction",
    },
    fullWidth: {
      control: "boolean",
      description: "Stretches to container width",
    },
    isIconOnly: {
      control: "boolean",
      description: "Square icon-only layout",
    },
    onPress: { action: "pressed" },
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

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Danger",
  },
};

export const LargePrimary: Story = {
  args: {
    ...Primary.args,
    size: "lg",
    children: "Large primary",
  },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    children: "Disabled",
    isDisabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    variant: "primary",
    children: "Full width",
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
};

export const IconOnly: Story = {
  args: {
    variant: "primary",
    size: "md",
    children: "★",
    isIconOnly: true,
    "aria-label": "Favorite",
  },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

/** Token notes for each variant (mono scale + danger red). */
export const ColorTokens: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="primary">Primary</Button>
        <span style={getBodyTextStyle("xs")}>
          Gradient indigo-950 → mono-950, mono-50 text
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="secondary">Secondary</Button>
        <span style={getBodyTextStyle("xs")}>
          mono-950 surface, mono-100 text
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost">Ghost</Button>
        <span style={getBodyTextStyle("xs")}>Transparent, mono-300 text</span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="danger">Danger</Button>
        <span style={getBodyTextStyle("xs")}>
          wn-red-500 / wn-red-600 hover
        </span>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
