import type { DeltaOp, LoreDoc } from "./loreDocTypes.js";
import { EMPTY_LORE_DOC } from "./loreDocTypes.js";

type PmNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type?: string }>;
  content?: PmNode[];
};

function inlineAttributes(marks: PmNode["marks"]): Record<string, unknown> {
  const attrs: Record<string, unknown> = {};
  for (const mark of marks ?? []) {
    if (mark.type === "bold") {
      attrs.bold = true;
    } else if (mark.type === "italic") {
      attrs.italic = true;
    } else if (mark.type === "underline") {
      attrs.underline = true;
    } else if (mark.type === "strike") {
      attrs.strike = true;
    } else if (mark.type === "code") {
      attrs.code = true;
    }
  }
  return attrs;
}

function pushInline(ops: DeltaOp[], node: PmNode): void {
  switch (node.type) {
    case "text": {
      if (!node.text) {
        return;
      }
      const attrs = inlineAttributes(node.marks);
      ops.push(
        Object.keys(attrs).length > 0
          ? { insert: node.text, attributes: attrs }
          : { insert: node.text },
      );
      return;
    }
    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      if (src) {
        ops.push({ insert: { image: src } });
      }
      return;
    }
    case "cardMention": {
      const id = typeof node.attrs?.id === "string" ? node.attrs.id : "";
      const label =
        typeof node.attrs?.label === "string" ? node.attrs.label : "Card";
      ops.push({ insert: { "card-mention": { id, label } } });
      return;
    }
    case "hardBreak":
      ops.push({ insert: "\n" });
      return;
    default:
      for (const child of node.content ?? []) {
        pushInline(ops, child);
      }
  }
}

function blockNewline(
  ops: DeltaOp[],
  attrs: Record<string, unknown>,
): void {
  ops.push(
    Object.keys(attrs).length > 0
      ? { insert: "\n", attributes: attrs }
      : { insert: "\n" },
  );
}

function blockAlign(node: PmNode): Record<string, unknown> {
  const align = node.attrs?.textAlign;
  if (align === "center" || align === "right" || align === "justify") {
    return { align };
  }
  return {};
}

function pushBlock(ops: DeltaOp[], node: PmNode): void {
  switch (node.type) {
    case "paragraph": {
      for (const child of node.content ?? []) {
        pushInline(ops, child);
      }
      blockNewline(ops, blockAlign(node));
      return;
    }
    case "heading": {
      for (const child of node.content ?? []) {
        pushInline(ops, child);
      }
      const level = Number(node.attrs?.level) || 1;
      blockNewline(ops, { ...blockAlign(node), header: Math.min(3, level) });
      return;
    }
    case "blockquote": {
      for (const child of node.content ?? []) {
        for (const inline of child.content ?? []) {
          pushInline(ops, inline);
        }
        blockNewline(ops, { blockquote: true });
      }
      return;
    }
    case "codeBlock": {
      for (const child of node.content ?? []) {
        pushInline(ops, child);
      }
      blockNewline(ops, { "code-block": true });
      return;
    }
    case "bulletList":
    case "orderedList": {
      const listType = node.type === "bulletList" ? "bullet" : "ordered";
      for (const item of node.content ?? []) {
        for (const block of item.content ?? []) {
          for (const inline of block.content ?? []) {
            pushInline(ops, inline);
          }
          blockNewline(ops, { list: listType });
        }
      }
      return;
    }
    case "loreGallery": {
      const paths = Array.isArray(node.attrs?.paths)
        ? (node.attrs.paths as string[])
        : [];
      ops.push({ insert: { "lore-gallery": { id: "", paths } } });
      return;
    }
    default: {
      // Unknown block: best-effort flatten of any text content.
      for (const child of node.content ?? []) {
        pushBlock(ops, child);
      }
    }
  }
}

/** Best-effort conversion of a TipTap/ProseMirror doc into a Quill Delta. */
export function migrateProseMirrorToDelta(doc: PmNode): LoreDoc {
  const ops: DeltaOp[] = [];
  for (const node of doc.content ?? []) {
    pushBlock(ops, node);
  }
  if (ops.length === 0) {
    return { ...EMPTY_LORE_DOC };
  }
  // Quill requires the document to end with a newline.
  const last = ops[ops.length - 1];
  const lastInsert = last?.insert;
  if (typeof lastInsert !== "string" || !lastInsert.endsWith("\n")) {
    ops.push({ insert: "\n" });
  }
  return { ops };
}

/** Minimal legacy markdown → Delta (paragraphs + ATX headings). */
export function migrateMarkdownToDelta(markdown: string): LoreDoc {
  const trimmed = markdown.trim();
  if (!trimmed) {
    return { ...EMPTY_LORE_DOC };
  }
  const ops: DeltaOp[] = [];
  for (const block of trimmed.split(/\n\n+/)) {
    const lines = block.split("\n");
    const first = lines[0] ?? "";
    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(first);
    if (headingMatch) {
      ops.push({ insert: headingMatch[2] });
      ops.push({
        insert: "\n",
        attributes: { header: Math.min(3, headingMatch[1].length) },
      });
      const rest = lines.slice(1).join("\n").trim();
      if (rest) {
        ops.push({ insert: rest }, { insert: "\n" });
      }
      continue;
    }
    ops.push({ insert: block }, { insert: "\n" });
  }
  return ops.length > 0 ? { ops } : { ...EMPTY_LORE_DOC };
}
