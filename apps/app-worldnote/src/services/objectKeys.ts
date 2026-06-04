/** Typed `Object.keys` for string-keyed records. */
export function objectKeys<T extends object>(value: T): (keyof T)[] {
  // cast: Object.keys returns string[]; keys are known members of T
  return Object.keys(value) as (keyof T)[];
}
