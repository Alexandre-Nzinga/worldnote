import Quill from "quill";
import Embed from "quill/blots/embed";
import { BlockEmbed } from "quill/blots/block";
import { cardImageSrc } from "../../../../services/canvas/cardNodeData.js";

export type CardMentionValue = {
  id: string;
  label: string;
};

export type GalleryValue = {
  id: string;
  paths: string[];
};

/**
 * Shared, mutable context the blots read at render time. Mirrors the
 * `getLoreOptions` pattern the previous TipTap editor used. The active
 * LoreEditor keeps this in sync; there is at most one lore editor mounted.
 */
type LoreBlotContext = {
  vaultPath: string;
  readOnly: boolean;
};

let context: LoreBlotContext = { vaultPath: "", readOnly: true };

export function setLoreBlotContext(next: LoreBlotContext): void {
  context = next;
}

export const GALLERY_ADD_ATTR = "data-gallery-add";
export const GALLERY_REMOVE_ATTR = "data-gallery-remove";

function renderGalleryInner(node: HTMLElement): void {
  const paths = readGalleryPaths(node);
  const { vaultPath, readOnly } = context;
  node.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "rounded-xl border border-wn-mono-800 bg-wn-mono-800/40 p-2";

  if (!readOnly) {
    const toolbar = document.createElement("div");
    toolbar.className = "mb-2 flex justify-end";
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.setAttribute(GALLERY_ADD_ATTR, "");
    addBtn.className =
      "flex items-center gap-1 rounded-lg bg-wn-mono-800 px-2 py-1 text-xs font-medium text-wn-mono-200 transition-colors hover:bg-wn-mono-700 hover:text-wn-mono-50";
    addBtn.contentEditable = "false";
    addBtn.innerHTML =
      '<span class="material-symbols-outlined select-none leading-none text-sm" aria-hidden="true">add_photo_alternate</span>Add image';
    toolbar.appendChild(addBtn);
    shell.appendChild(toolbar);
  }

  if (paths.length === 0) {
    const empty = document.createElement("p");
    empty.className = "px-1 py-4 text-center text-sm text-wn-mono-500";
    empty.textContent = "No images in gallery";
    shell.appendChild(empty);
  } else {
    const grid = document.createElement("div");
    grid.className =
      "lore-gallery-grid grid grid-cols-2 gap-2 sm:grid-cols-3";
    paths.forEach((path, index) => {
      const cell = document.createElement("div");
      cell.className =
        "relative aspect-square overflow-hidden rounded-lg bg-wn-mono-800";
      const src = cardImageSrc(vaultPath, path);
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "";
        img.draggable = false;
        img.className = "h-full w-full object-cover";
        cell.appendChild(img);
      }
      if (!readOnly) {
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.setAttribute(GALLERY_REMOVE_ATTR, String(index));
        removeBtn.setAttribute("aria-label", "Remove image");
        removeBtn.contentEditable = "false";
        removeBtn.className =
          "absolute right-1 top-1 rounded-md bg-wn-mono-950/80 p-0.5 text-wn-mono-200 hover:text-wn-mono-50";
        removeBtn.innerHTML =
          '<span class="material-symbols-outlined select-none leading-none text-sm" aria-hidden="true">close</span>';
        cell.appendChild(removeBtn);
      }
      grid.appendChild(cell);
    });
    shell.appendChild(grid);
  }

  node.appendChild(shell);
}

export function readGalleryPaths(node: HTMLElement): string[] {
  try {
    const parsed = JSON.parse(node.getAttribute("data-paths") ?? "[]");
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

class CardMentionBlot extends Embed {
  static blotName = "card-mention";
  static tagName = "span";
  static className = "lore-card-mention";

  static create(value: CardMentionValue): HTMLElement {
    const node = document.createElement(CardMentionBlot.tagName);
    node.classList.add(CardMentionBlot.className);
    node.setAttribute("data-type", "card-mention");
    node.setAttribute("data-id", value?.id ?? "");
    node.setAttribute("data-label", value?.label ?? "");
    node.textContent = value?.label ?? "Card";
    return node;
  }

  static value(node: HTMLElement): CardMentionValue {
    return {
      id: node.getAttribute("data-id") ?? "",
      label: node.getAttribute("data-label") ?? "",
    };
  }
}

class GalleryBlot extends BlockEmbed {
  static blotName = "lore-gallery";
  static tagName = "div";
  static className = "lore-gallery-block";

  static create(value: GalleryValue): HTMLElement {
    const node = document.createElement(GalleryBlot.tagName);
    node.classList.add(GalleryBlot.className);
    const id =
      value?.id ||
      (globalThis.crypto?.randomUUID?.() ?? `gallery-${Date.now()}`);
    node.setAttribute("data-type", "lore-gallery");
    node.setAttribute("data-gallery-id", id);
    node.setAttribute("data-paths", JSON.stringify(value?.paths ?? []));
    node.setAttribute("contenteditable", "false");
    renderGalleryInner(node);
    return node;
  }

  static value(node: HTMLElement): GalleryValue {
    return {
      id: node.getAttribute("data-gallery-id") ?? "",
      paths: readGalleryPaths(node),
    };
  }
}

let registered = false;

export function registerLoreBlots(): void {
  if (registered) {
    return;
  }
  Quill.register(CardMentionBlot as never);
  Quill.register(GalleryBlot as never);
  registered = true;
}
