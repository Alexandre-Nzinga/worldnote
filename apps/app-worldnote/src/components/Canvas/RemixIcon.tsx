type RemixIconProps = {
  name: string;
  className?: string;
};

/** Remix Icon font glyph (see global.css import). */
export function RemixIcon({ name, className = "text-[20px]" }: RemixIconProps) {
  return <i className={`${name} leading-none ${className}`} aria-hidden />;
}
