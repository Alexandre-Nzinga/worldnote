import Quill from "quill";
import "quill/dist/quill.core.css";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { WorldCard } from "@worldnote/shared";
import {
  addCardLoreImage,
  pickCardImageFile,
} from "../../../../services/desktop/saveCardImage.js";
import { cardImageSrc } from "../../../../services/canvas/cardNodeData.js";
import type { LoreDoc } from "./loreDocTypes.js";
import { EMPTY_LORE_DOC } from "./loreDocTypes.js";
import type { LoreExtensionOptions } from "./loreExtensionOptions.js";
import { LoreToolbar } from "./LoreToolbar.js";
import { MentionList } from "./MentionList.js";
import {
  GALLERY_ADD_ATTR,
  GALLERY_REMOVE_ATTR,
  readGalleryPaths,
  registerLoreBlots,
  setLoreBlotContext,
} from "./registerLoreBlots.js";
import { useMentionAutocomplete } from "./useMentionAutocomplete.js";

registerLoreBlots();

const QuillDelta = Quill.import("delta") as new (ops?: unknown) => unknown;

export type LoreEditorSnapshot = {
  doc: LoreDoc;
  plainText: string;
};

export type LoreEditorHandle = {
  getSnapshot: () => LoreEditorSnapshot;
  blur: () => void;
};

function snapshotFromEditor(editor: Quill): LoreEditorSnapshot {
  return {
    doc: { ops: editor.getContents().ops as LoreDoc["ops"] },
    plainText: editor.getText(),
  };
}

type LoreEditorProps = {
  readOnly: boolean;
  initialDoc: LoreDoc;
  vaultPath: string;
  cardId: string;
  cardsById: Record<string, WorldCard>;
  autoFocus?: boolean;
  onChange: (doc: LoreDoc, plainText: string) => void;
  onNavigateToCard?: (cardId: string) => void;
};

export const LoreEditor = forwardRef<LoreEditorHandle, LoreEditorProps>(
  function LoreEditor(
    {
      readOnly,
      initialDoc,
      vaultPath,
      cardId,
      cardsById,
      autoFocus = false,
      onChange,
      onNavigateToCard,
    },
    ref,
  ) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [quill, setQuill] = useState<Quill | null>(null);
  const [format, setFormat] = useState<Record<string, unknown>>({});

  const optionsRef = useRef<LoreExtensionOptions>({
    vaultPath,
    cardId,
    readOnly,
    cardsById,
    onNavigateToCard,
  });
  optionsRef.current = { vaultPath, cardId, readOnly, cardsById, onNavigateToCard };
  setLoreBlotContext({ vaultPath, readOnly });

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const initialDocRef = useRef(initialDoc);
  initialDocRef.current = initialDoc;

  const getOptions = useCallback(() => optionsRef.current, []);

  const mention = useMentionAutocomplete({ quill, getOptions });

  const syncEditorFromDoc = useCallback((doc: LoreDoc) => {
    const editor = quillRef.current;
    if (!editor) {
      return;
    }
    editor.setContents(
      new QuillDelta((doc ?? EMPTY_LORE_DOC).ops) as never,
      "silent",
    );
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getSnapshot: () => {
        const editor = quillRef.current;
        if (!editor) {
          return {
            doc: initialDocRef.current ?? EMPTY_LORE_DOC,
            plainText: "",
          };
        }
        return snapshotFromEditor(editor);
      },
      blur: () => {
        quillRef.current?.blur();
      },
    }),
    [],
  );

  const updateGalleryPaths = useCallback(
    (galleryEl: HTMLElement, nextPaths: string[]) => {
      const editor = quillRef.current;
      if (!editor) {
        return;
      }
      const blot = Quill.find(galleryEl);
      if (!blot) {
        return;
      }
      const index = editor.getIndex(blot as never);
      const id = galleryEl.getAttribute("data-gallery-id") ?? "";
      editor.deleteText(index, 1, "user");
      editor.insertEmbed(
        index,
        "lore-gallery",
        { id, paths: nextPaths },
        "user",
      );
    },
    [],
  );

  const addImageToGallery = useCallback(
    async (galleryEl: HTMLElement) => {
      const { vaultPath: vp, cardId: cid, readOnly: ro } = optionsRef.current;
      if (ro || !vp || !cid) {
        return;
      }
      const source = await pickCardImageFile();
      if (!source) {
        return;
      }
      const relativePath = await addCardLoreImage(vp, cid, source);
      updateGalleryPaths(galleryEl, [...readGalleryPaths(galleryEl), relativePath]);
    },
    [updateGalleryPaths],
  );

  // Create the Quill instance once.
  useEffect(() => {
    if (!containerRef.current || quillRef.current) {
      return;
    }
    const editor = new Quill(containerRef.current, {
      modules: { toolbar: false },
      formats: [
        "bold",
        "italic",
        "underline",
        "strike",
        "code",
        "header",
        "list",
        "align",
        "blockquote",
        "code-block",
        "image",
        "card-mention",
        "lore-gallery",
      ],
      placeholder: "Write the lore…",
    });
    editor.setContents(
      new QuillDelta((initialDocRef.current ?? EMPTY_LORE_DOC).ops) as never,
      "silent",
    );
    quillRef.current = editor;
    setQuill(editor);

    const handleTextChange = (
      _delta: unknown,
      _old: unknown,
      source: string,
    ) => {
      if (source === "silent") {
        return;
      }
      const { doc, plainText } = snapshotFromEditor(editor);
      onChangeRef.current(doc, plainText);
    };
    const handleEditorChange = () => {
      setFormat(editor.getFormat());
    };
    editor.on("text-change", handleTextChange);
    editor.on("editor-change", handleEditorChange);
    editor.blur();

    return () => {
      editor.off("text-change", handleTextChange);
      editor.off("editor-change", handleEditorChange);
      quillRef.current = null;
    };
  }, []);

  // Toggle editability without stealing focus from title/subtitle fields.
  useEffect(() => {
    if (!quill) {
      return;
    }
    quill.enable(!readOnly);
    const active = document.activeElement;
    const focusIsInsideEditor =
      active instanceof Node && quill.root.contains(active);
    if (!focusIsInsideEditor) {
      quill.blur();
    }
  }, [quill, readOnly]);

  useEffect(() => {
    if (!quill || readOnly || !autoFocus) {
      return;
    }
    quill.focus();
  }, [autoFocus, quill, readOnly]);

  // Reload when switching cards, or when viewing read-only content from disk.
  const loadedCardIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!quill) {
      return;
    }
    const cardChanged = loadedCardIdRef.current !== cardId;
    if (!cardChanged && !readOnly) {
      return;
    }
    loadedCardIdRef.current = cardId;
    syncEditorFromDoc(initialDoc ?? EMPTY_LORE_DOC);
    const active = document.activeElement;
    const focusIsInsideEditor =
      active instanceof Node && quill.root.contains(active);
    if (!focusIsInsideEditor) {
      quill.blur();
    }
  }, [quill, initialDoc, cardId, readOnly, syncEditorFromDoc]);

  // Click delegation: mention navigation (read-only) + gallery controls.
  useEffect(() => {
    if (!quill) {
      return;
    }
    const root = quill.root;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const opts = optionsRef.current;
      const mentionEl = target.closest<HTMLElement>("[data-type='card-mention']");
      if (mentionEl && opts.readOnly) {
        const id = mentionEl.getAttribute("data-id");
        if (id) {
          opts.onNavigateToCard?.(id);
          return;
        }
      }
      if (opts.readOnly) {
        return;
      }
      const galleryEl = target.closest<HTMLElement>(
        "[data-type='lore-gallery']",
      );
      if (!galleryEl) {
        return;
      }
      if (target.closest(`[${GALLERY_ADD_ATTR}]`)) {
        void addImageToGallery(galleryEl);
        return;
      }
      const removeBtn = target.closest<HTMLElement>(`[${GALLERY_REMOVE_ATTR}]`);
      if (removeBtn) {
        const index = Number(removeBtn.getAttribute(GALLERY_REMOVE_ATTR));
        const paths = readGalleryPaths(galleryEl).filter((_, i) => i !== index);
        updateGalleryPaths(galleryEl, paths);
      }
    };
    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  }, [quill, addImageToGallery, updateGalleryPaths]);

  const insertImage = useCallback(async () => {
    const editor = quillRef.current;
    if (!editor || readOnly) {
      return;
    }
    const source = await pickCardImageFile();
    if (!source) {
      return;
    }
    const relativePath = await addCardLoreImage(vaultPath, cardId, source);
    const src = cardImageSrc(vaultPath, relativePath);
    if (!src) {
      return;
    }
    const range = editor.getSelection();
    const index = range ? range.index : editor.getLength();
    editor.insertEmbed(index, "image", src, "user");
    editor.setSelection(index + 1, 0, "user");
  }, [readOnly, vaultPath, cardId]);

  const insertGallery = useCallback(() => {
    const editor = quillRef.current;
    if (!editor || readOnly) {
      return;
    }
    const range = editor.getSelection();
    const index = range ? range.index : editor.getLength();
    editor.insertEmbed(
      index,
      "lore-gallery",
      {
        id: globalThis.crypto?.randomUUID?.() ?? `gallery-${Date.now()}`,
        paths: [],
      },
      "user",
    );
    editor.setSelection(index + 1, 0, "user");
  }, [readOnly]);

  const portalTarget = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    [],
  );

  return (
    <div
      className={
        readOnly
          ? "lore-editor-readonly"
          : "lore-editor-editable rounded-xl border border-wn-mono-800"
      }
    >
      {!readOnly && quill ? (
        <LoreToolbar
          quill={quill}
          format={format}
          onInsertImage={() => {
            void insertImage();
          }}
          onInsertGallery={insertGallery}
        />
      ) : null}
      <div className="lore-editor-prose inspector-markdown" ref={containerRef} />
      {mention.popup.open && portalTarget
        ? createPortal(
            <div
              className="lore-mention-suggestion"
              style={{
                position: "fixed",
                top: mention.popup.top,
                left: mention.popup.left,
                zIndex: 100,
              }}
            >
              <MentionList
                ref={mention.listRef}
                items={mention.popup.items}
                command={mention.select}
              />
            </div>,
            portalTarget,
          )
        : null}
    </div>
  );
  },
);
