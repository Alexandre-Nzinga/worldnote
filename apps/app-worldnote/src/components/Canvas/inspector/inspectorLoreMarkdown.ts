/** Drop a redundant leading "Lore" title from card markdown (legacy UI / imports). */
export function stripLeadingLoreHeading(markdown: string): string {
  let rest = markdown.replace(/^\uFEFF/, "").trimStart();
  const atx = /^(#{1,6})[ \t]+Lore[ \t]*(?:\r?\n|$)/i;
  while (atx.test(rest)) {
    rest = rest.replace(atx, "").trimStart();
  }
  const plain = /^Lore[ \t]*(?:\r?\n|$)/i;
  while (plain.test(rest)) {
    rest = rest.replace(plain, "").trimStart();
  }
  return rest;
}
