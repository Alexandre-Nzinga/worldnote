import clsx from "clsx";
import { MaterialSymbol } from "../MaterialSymbol/MaterialSymbol.js";
import { Button, type ButtonProps } from "./Button.js";

export type CloseIconButtonProps = Omit<
  ButtonProps,
  "children" | "isIconOnly" | "variant" | "size"
> & {
  "aria-label": string;
};

/** Icon-only tertiary close control for panel and modal headers. */
export function CloseIconButton({ className, ...props }: CloseIconButtonProps) {
  return (
    <Button
      variant="tertiary"
      size="sm"
      isIconOnly
      className={clsx("min-w-9 shrink-0 px-0", className)}
      {...props}
    >
      <MaterialSymbol name="close" className="text-lg" />
    </Button>
  );
}
