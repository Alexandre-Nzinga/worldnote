import type { Meta, StoryObj } from "@storybook/react";
import { Button, MaterialSymbol, type ButtonVariant } from "@worldnote/ui";

const variants: ButtonVariant[] = [
  "primary",
  "white",
  "secondary",
  "tertiary",
  "outline",
  "ghost",
  "link",
  "danger",
];

const meta = {
  title: "01-Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "radio", options: ["sm", "base"] },
    children: { control: "text" },
    isDisabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    isIconOnly: { control: "boolean" },
    onPress: { action: "pressed" },
  },
  args: {
    children: "Button",
    variant: "primary",
    size: "base",
    isDisabled: false,
    fullWidth: false,
    isIconOnly: false,
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary", children: "Create world" },
};

export const White: Story = {
  args: { variant: "white", children: "Create world" },
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-wn-mono-950 p-12">
        <Story />
      </div>
    ),
  ],
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Cancel" },
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-wn-mono-950 p-12">
        <Story />
      </div>
    ),
  ],
};

export const Outline: Story = {
  args: { variant: "outline", children: "Back to home" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {variants.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const WithIconChip: Story = {
  args: {
    variant: "white",
    children: "Discover the Hub",
    iconChip: <MaterialSymbol name="play_arrow" className="text-base" />,
    iconChipPlacement: "start",
  },
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-wn-mono-950 p-12">
        <Story />
      </div>
    ),
  ],
};

export const WithStartEndContent: Story = {
  args: {
    variant: "primary",
    children: "More about us",
    endContent: (
      <span className="h-1.5 w-1.5 rounded-full bg-wn-azure-500" aria-hidden />
    ),
  },
};
