/** Minimal className joiner (avoids an extra clsx dependency in the app). */
export function cx(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
