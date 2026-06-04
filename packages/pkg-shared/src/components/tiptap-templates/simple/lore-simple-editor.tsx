import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Placeholder, Selection } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";

import { Spacer } from "../../tiptap-ui-primitive/spacer/spacer.js";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "../../tiptap-ui-primitive/toolbar/toolbar.js";

import "../../tiptap-node/blockquote-node/blockquote-node.scss";
import "../../tiptap-node/code-block-node/code-block-node.scss";
import "../../tiptap-node/list-node/list-node.scss";
import "../../tiptap-node/heading-node/heading-node.scss";
import "../../tiptap-node/paragraph-node/paragraph-node.scss";

import { HeadingDropdownMenu } from "../../tiptap-ui/heading-dropdown-menu/heading-dropdown-menu.js";
import { ListDropdownMenu } from "../../tiptap-ui/list-dropdown-menu/list-dropdown-menu.js";
import { BlockquoteButton } from "../../tiptap-ui/blockquote-button/blockquote-button.js";
import { CodeBlockButton } from "../../tiptap-ui/code-block-button/code-block-button.js";
import { ColorHighlightPopover } from "../../tiptap-ui/color-highlight-popover/color-highlight-popover.js";
import { LinkPopover } from "../../tiptap-ui/link-popover/link-popover.js";
import { MarkButton } from "../../tiptap-ui/mark-button/mark-button.js";
import { TextAlignButton } from "../../tiptap-ui/text-align-button/text-align-button.js";
import { UndoRedoButton } from "../../tiptap-ui/undo-redo-button/undo-redo-button.js";

import "../../../styles/_variables.scss";
import "../../../styles/_keyframe-animations.scss";
import "./simple-editor.scss";
import "./lore-simple-editor.scss";

export type LoreSimpleEditorHandle = {
  getMarkdown: () => string;
  blur: () => void;
};

type LoreSimpleEditorProps = {
  value?: string;
  editable?: boolean;
  placeholder?: string;
  onChange?: (markdown: string) => void;
};

function LoreToolbar() {
  return (
    <>
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        <ColorHighlightPopover />
        <LinkPopover />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
      </ToolbarGroup>
    </>
  );
}

export const LoreSimpleEditor = forwardRef<
  LoreSimpleEditorHandle,
  LoreSimpleEditorProps
>(function LoreSimpleEditor(
  { value = "", editable = true, placeholder = "Write the lore…", onChange },
  ref,
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastEmittedRef = useRef(value);

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Superscript,
      Subscript,
      Selection,
      Placeholder.configure({ placeholder }),
      Markdown,
    ],
    content: value,
    contentType: "markdown",
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Card lore editor",
        class: "simple-editor lore-simple-editor-content",
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

  if (!editor) {
    return (
      <div className="lore-simple-editor-wrapper lore-simple-editor-loading">
        <div className="min-h-48 rounded-xl border border-wn-mono-800 bg-wn-mono-950/40" />
      </div>
    );
  }

  return (
    <div className="lore-simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        {editable ? (
          <Toolbar className="lore-simple-editor-toolbar">
            <LoreToolbar />
            <Spacer />
          </Toolbar>
        ) : null}

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content lore-simple-editor-content-area"
        />
      </EditorContext.Provider>
    </div>
  );
});

LoreSimpleEditor.displayName = "LoreSimpleEditor";
