import type { Editor } from "@tiptap/core";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import {
  BLOCKQUOTE_SHORTCUT_KEY,
  useBlockquote,
} from "@worldnote/shared/components/tiptap-ui/blockquote-button";
import { parseShortcutKeys } from "@worldnote/shared/lib/tiptap-utils";
import { MaterialSymbol } from "@worldnote/ui";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export type InspectorLoreEditorHandle = {
  getMarkdown: () => string;
  blur: () => void;
  getEditor: () => Editor | null;
  getScrollElement: () => HTMLElement | null;
};

type InspectorLoreEditorProps = {
  value?: string;
  editable?: boolean;
  placeholder?: string;
  /** When true, editor body fills available column height (modal layout). */
  fillHeight?: boolean;
  /** When true, spans the inspector width (no side inset or corner radius). */
  flushWidth?: boolean;
  onChange?: (markdown: string) => void;
  onEditorReady?: (editor: Editor | null) => void;
};

type ToolbarButtonProps = {
  label: string;
  icon: string;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({
  label,
  icon,
  title,
  active = false,
  disabled = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title ?? label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={[
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-wn-mono-400 transition-colors",
        "hover:bg-wn-mono-800 hover:text-wn-mono-100",
        "disabled:pointer-events-none disabled:opacity-40",
        active ? "bg-wn-mono-800 text-wn-mono-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <MaterialSymbol name={icon} className="text-[18px]" />
    </button>
  );
}

function InspectorLoreToolbar({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
  const run = useCallback(
    (command: () => boolean) => {
      command();
    },
    [],
  );

  return (
    <div
      className="inspector-lore-toolbar flex shrink-0 flex-wrap items-center gap-0.5 border-b border-wn-mono-800 bg-wn-mono-950 px-2 py-1.5"
      role="toolbar"
      aria-label="Formatting"
    >
      <ToolbarButton
        label="Undo"
        icon="undo"
        onClick={() => run(() => editor.chain().focus().undo().run())}
      />
      <ToolbarButton
        label="Redo"
        icon="redo"
        onClick={() => run(() => editor.chain().focus().redo().run())}
      />
      <span className="mx-1 h-5 w-px shrink-0 bg-wn-mono-800" aria-hidden />
      <ToolbarButton
        label="Bold"
        icon="format_bold"
        active={editor.isActive("bold")}
        onClick={() => run(() => editor.chain().focus().toggleBold().run())}
      />
      <ToolbarButton
        label="Italic"
        icon="format_italic"
        active={editor.isActive("italic")}
        onClick={() => run(() => editor.chain().focus().toggleItalic().run())}
      />
      <ToolbarButton
        label="Strikethrough"
        icon="format_strikethrough"
        active={editor.isActive("strike")}
        onClick={() => run(() => editor.chain().focus().toggleStrike().run())}
      />
      <ToolbarButton
        label="Code"
        icon="code"
        active={editor.isActive("code")}
        onClick={() => run(() => editor.chain().focus().toggleCode().run())}
      />
      <span className="mx-1 h-5 w-px shrink-0 bg-wn-mono-800" aria-hidden />
      <ToolbarButton
        label="Heading 1"
        icon="format_h1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          run(() => editor.chain().focus().toggleHeading({ level: 1 }).run())
        }
      />
      <ToolbarButton
        label="Heading 2"
        icon="format_h2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          run(() => editor.chain().focus().toggleHeading({ level: 2 }).run())
        }
      />
      <ToolbarButton
        label="Bullet list"
        icon="format_list_bulleted"
        active={editor.isActive("bulletList")}
        onClick={() => run(() => editor.chain().focus().toggleBulletList().run())}
      />
      <ToolbarButton
        label="Numbered list"
        icon="format_list_numbered"
        active={editor.isActive("orderedList")}
        onClick={() => run(() => editor.chain().focus().toggleOrderedList().run())}
      />
      <InspectorLoreBlockquoteButton editor={editor} />
    </div>
  );
}

function InspectorLoreBlockquoteButton({
  editor,
}: {
  editor: NonNullable<ReturnType<typeof useEditor>>;
}) {
  const { isVisible, isActive, canToggle, handleToggle, label } = useBlockquote({
    editor,
  });

  const shortcutHint = parseShortcutKeys({
    shortcutKeys: BLOCKQUOTE_SHORTCUT_KEY,
  }).join("");

  if (!isVisible) {
    return null;
  }

  return (
    <ToolbarButton
      label={label}
      icon="format_quote"
      title={shortcutHint ? `${label} (${shortcutHint})` : label}
      active={isActive}
      disabled={!canToggle}
      onClick={() => handleToggle()}
    />
  );
}

export const InspectorLoreEditor = forwardRef<
  InspectorLoreEditorHandle,
  InspectorLoreEditorProps
>(function InspectorLoreEditor(
  {
    value = "",
    editable = true,
    placeholder = "Write the lore…",
    fillHeight = false,
    flushWidth = false,
    onChange,
    onEditorReady,
  },
  ref,
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onEditorReadyRef = useRef(onEditorReady);
  onEditorReadyRef.current = onEditorReady;
  const lastEmittedRef = useRef(value);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Markdown,
    ],
    content: value,
    contentType: "markdown",
    editorProps: {
      attributes: {
        class: "inspector-lore-editor-prose outline-none",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: ed }) => {
      const markdown = ed.getMarkdown();
      lastEmittedRef.current = markdown;
      onChangeRef.current?.(markdown);
    },
  });

  useImperativeHandle(
    ref,
    () => ({
      getMarkdown: () => editor?.getMarkdown() ?? "",
      blur: () => editor?.commands.blur(),
      getEditor: () => editor ?? null,
      getScrollElement: () => scrollContainerRef.current,
    }),
    [editor],
  );

  useEffect(() => {
    onEditorReadyRef.current?.(editor ?? null);
    return () => {
      onEditorReadyRef.current?.(null);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    if (value === lastEmittedRef.current) {
      return;
    }
    if (value !== editor.getMarkdown()) {
      editor.commands.setContent(value, { contentType: "markdown" });
      lastEmittedRef.current = value;
    }
  }, [editor, value]);

  const rootClassName = [
    "inspector-lore-editor flex w-full flex-col overflow-hidden bg-wn-mono-900",
    fillHeight
      ? [
          "inspector-lore-editor--fill min-h-0 flex-1 rounded-none border-0",
          flushWidth
            ? "border-y border-wn-mono-800"
            : "border-t border-wn-mono-800",
        ].join(" ")
      : flushWidth
        ? "min-h-[10rem] rounded-none border-0 border-y border-wn-mono-800"
        : "min-h-[10rem] rounded-xl border border-wn-mono-800",
  ].join(" ");

  const scrollClassName = [
    "inspector-lore-editor-scroll scrollbar-wn min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
    fillHeight ? "inspector-lore-editor-scroll--fill" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!editor) {
    return (
      <div className={`${rootClassName} animate-pulse`}>
        <div className="h-10 border-b border-wn-mono-800 bg-wn-mono-950" />
        <div className="min-h-[8rem] flex-1" />
      </div>
    );
  }

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className={rootClassName}>
        {editable ? <InspectorLoreToolbar editor={editor} /> : null}
        <div ref={scrollContainerRef} className={scrollClassName}>
          <EditorContent
            editor={editor}
            role="presentation"
            className="inspector-lore-editor-body"
          />
        </div>
      </div>
    </EditorContext.Provider>
  );
});

InspectorLoreEditor.displayName = "InspectorLoreEditor";
