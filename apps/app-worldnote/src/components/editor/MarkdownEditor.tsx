import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type MarkdownEditorHandle = {
  getMarkdown: () => string;
  blur: () => void;
};

type MarkdownEditorProps = {
  value: string;
  editable?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  proseClassName?: string;
  onChange?: (markdown: string) => void;
};

export const MarkdownEditor = forwardRef<
  MarkdownEditorHandle,
  MarkdownEditorProps
>(function MarkdownEditor(
  {
    value,
    editable = true,
    placeholder = "Start typing…",
    autoFocus = false,
    className = "",
    proseClassName = "markdown-editor-prose",
    onChange,
  },
  ref,
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastEmittedRef = useRef(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Markdown,
    ],
    content: value,
    contentType: "markdown",
    editable,
    editorProps: {
      attributes: {
        class: "outline-none min-h-[3rem] w-full",
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
    }),
    [editor],
  );

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

  useEffect(() => {
    if (!editor || !autoFocus || !editable) {
      return;
    }
    editor.commands.focus("end");
  }, [editor, autoFocus, editable]);

  if (!editor) {
    return <div className={`min-h-[3rem] ${className}`} />;
  }

  return (
    <div className={className}>
      <EditorContent
        editor={editor}
        className={`${proseClassName} min-h-0 flex-1 overflow-y-auto`}
      />
    </div>
  );
});

MarkdownEditor.displayName = "MarkdownEditor";
