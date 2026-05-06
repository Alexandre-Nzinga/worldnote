import {
  Button as HeroUIButton,
  type ButtonProps as HeroUIButtonProps,
} from "@heroui/react";

export type ButtonProps = HeroUIButtonProps;

/** HeroUI button with WorldNote defaults */
export function Button(props: ButtonProps) {
  return (
    <HeroUIButton
      radius="lg"
      variant="solid"
      className="font-medium"
      {...props}
    />
  );
}
