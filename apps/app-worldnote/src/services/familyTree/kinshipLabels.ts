export type CharacterGender = "male" | "female" | "x" | undefined;

export const KINSHIP_FALLBACK = "Relative";

export function greatPrefix(generationsAboveGrand: number): string {
  if (generationsAboveGrand <= 0) {
    return "";
  }
  return `${"Great-".repeat(generationsAboveGrand)}`;
}

export function parentLabel(gender: CharacterGender): string {
  if (gender === "female") {
    return "Mother";
  }
  if (gender === "male") {
    return "Father";
  }
  return "Parent";
}

export function childLabel(gender: CharacterGender): string {
  if (gender === "female") {
    return "Daughter";
  }
  if (gender === "male") {
    return "Son";
  }
  return "Child";
}

export function siblingLabel(gender: CharacterGender): string {
  if (gender === "female") {
    return "Sister";
  }
  if (gender === "male") {
    return "Brother";
  }
  return "Sibling";
}

export function halfSiblingLabel(gender: CharacterGender): string {
  if (gender === "female") {
    return "Half-sister";
  }
  if (gender === "male") {
    return "Half-brother";
  }
  return "Half-sibling";
}

export function grandparentLabel(gender: CharacterGender, up: number): string {
  const prefix = greatPrefix(up - 2);
  if (gender === "female") {
    return `${prefix}Grandmother`;
  }
  if (gender === "male") {
    return `${prefix}Grandfather`;
  }
  return `${prefix}Grandparent`;
}

export function grandchildLabel(gender: CharacterGender, down: number): string {
  const prefix = greatPrefix(down - 2);
  if (gender === "female") {
    return `${prefix}Granddaughter`;
  }
  if (gender === "male") {
    return `${prefix}Grandson`;
  }
  return `${prefix}Grandchild`;
}

export function auntUncleLabel(gender: CharacterGender, up: number): string {
  const prefix = greatPrefix(up - 2);
  if (gender === "female") {
    return `${prefix}Aunt`;
  }
  if (gender === "male") {
    return `${prefix}Uncle`;
  }
  return `${prefix}Parent's sibling`;
}

export function nieceNephewLabel(gender: CharacterGender, down: number): string {
  const prefix = greatPrefix(down - 2);
  if (gender === "female") {
    return `${prefix}Niece`;
  }
  if (gender === "male") {
    return `${prefix}Nephew`;
  }
  return `${prefix}Sibling's child`;
}

export function spouseLabel(gender: CharacterGender): string {
  if (gender === "female") {
    return "Wife";
  }
  if (gender === "male") {
    return "Husband";
  }
  return "Spouse";
}

export function inLawChildLabel(gender: CharacterGender): string {
  if (gender === "female") {
    return "Daughter-in-law";
  }
  if (gender === "male") {
    return "Son-in-law";
  }
  return "Child-in-law";
}

export function inLawParentLabel(gender: CharacterGender): string {
  if (gender === "female") {
    return "Mother-in-law";
  }
  if (gender === "male") {
    return "Father-in-law";
  }
  return "Parent-in-law";
}

export function inLawSiblingLabel(gender: CharacterGender): string {
  if (gender === "female") {
    return "Sister-in-law";
  }
  if (gender === "male") {
    return "Brother-in-law";
  }
  return "Sibling-in-law";
}

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${n}th`;
  }
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/** Degree and removal from LCA distances (up from anchor, down to person). */
export function cousinLabel(
  _gender: CharacterGender,
  up: number,
  down: number,
): string {
  const degree = Math.min(up, down) - 1;
  const removed = Math.abs(up - down);
  const degreeText = ordinal(degree);
  if (removed === 0) {
    return `${degreeText} Cousin`;
  }
  if (removed === 1) {
    return `${degreeText} Cousin once removed`;
  }
  return `${degreeText} Cousin ${removed} times removed`;
}
